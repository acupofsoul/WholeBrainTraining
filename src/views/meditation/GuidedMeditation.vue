<template>
  <div class="guided-meditation-container">

    <div class="meditation-player">
      <div class="player-card">
        <div class="meditation-info">
          <h3>{{ currentMeditation.title }}</h3>
          <p class="meditation-description">{{ currentMeditation.description }}</p>
          <div class="meditation-meta">
            <span class="duration">⏱️ {{ currentMeditation.duration }}分钟</span>
            <span class="difficulty">📊 {{ getDifficultyText(currentMeditation.difficulty) }}</span>
            <span class="category">🏷️ {{ currentMeditation.category }}</span>
          </div>
        </div>
        
        <div class="player-controls">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="time-display">
              <span class="current-time">{{ formatTime(currentTime) }}</span>
              <span class="total-time">{{ formatTime(totalTime) }}</span>
            </div>
          </div>
          
          <div class="control-buttons">
            <button class="control-btn" @click="previousTrack" :disabled="currentIndex === 0">
              ⏮️
            </button>
            <button class="play-pause-btn" @click="togglePlayPause">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="nextTrack" :disabled="currentIndex === meditations.length - 1">
              ⏭️
            </button>
          </div>
          
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
        </div>
      </div>
    </div>

    <div class="meditation-library">
      <h3>冥想音频库</h3>
      <div class="library-filters">
        <div class="filter-group">
          <label>分类：</label>
          <select v-model="selectedCategory" @change="filterMeditations">
            <option 
              v-for="category in categories" 
              :key="category.value" 
              :value="category.value"
            >
              {{ category.icon }} {{ category.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>时长：</label>
          <select v-model="selectedDuration" @change="filterMeditations">
            <option value="all">全部</option>
            <option value="short">5-10分钟</option>
            <option value="medium">10-20分钟</option>
            <option value="long">20分钟以上</option>
          </select>
        </div>
      </div>
      
      <div class="meditation-grid">
        <div 
          v-for="(meditation, index) in filteredMeditations" 
          :key="meditation.id"
          class="meditation-card"
          :class="{ active: currentIndex === index }"
          @click="selectMeditation(index)"
        >
          <div class="card-header">
            <div class="meditation-icon">{{ meditation.icon }}</div>
            <div class="play-indicator" v-if="currentIndex === index && isPlaying">
              🎵
            </div>
          </div>
          
          <h4>{{ meditation.title }}</h4>
          <p class="card-description">{{ meditation.shortDescription }}</p>
          
          <div class="card-meta">
            <span class="duration">{{ meditation.duration }}分钟</span>
            <span class="difficulty" :class="meditation.difficulty">
              {{ getDifficultyText(meditation.difficulty) }}
            </span>
          </div>
          
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">完成次数：</span>
              <span class="stat-value">{{ meditation.completedCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最后练习：</span>
              <span class="stat-value">{{ formatLastPractice(meditation.lastPractice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="meditation-settings">
      <h3>冥想设置</h3>
      <div class="settings-grid">
        <div class="setting-card">
          <h4>🔔 提醒设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.dailyReminder">
              每日冥想提醒
            </label>
          </div>
          <div class="setting-item" v-if="settings.dailyReminder">
            <label>提醒时间：</label>
            <input type="time" v-model="settings.reminderTime" class="time-input">
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎯 目标设定</h4>
          <div class="setting-item">
            <label>每日目标时长（分钟）：</label>
            <input 
              type="number" 
              v-model="settings.dailyGoal" 
              min="5" 
              max="120" 
              class="number-input"
            >
          </div>
          <div class="setting-item">
            <label>每周目标天数：</label>
            <input 
              type="number" 
              v-model="settings.weeklyGoal" 
              min="1" 
              max="7" 
              class="number-input"
            >
          </div>
        </div>
        
        <div class="setting-card">
          <h4>🎵 音频设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.autoPlay">
              自动播放下一个
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.fadeInOut">
              淡入淡出效果
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="meditation-progress">
      <h3>冥想进度</h3>
      <div class="progress-overview">
        <div class="progress-card">
          <div class="progress-icon">📅</div>
          <div class="progress-info">
            <h4>今日进度</h4>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: todayProgressPercentage + '%' }"></div>
              </div>
              <span class="progress-text">{{ todayMinutes }}/{{ settings.dailyGoal }}分钟</span>
            </div>
          </div>
        </div>
        
        <div class="progress-card">
          <div class="progress-icon">🗓️</div>
          <div class="progress-info">
            <h4>本周进度</h4>
            <div class="week-calendar">
              <div 
                v-for="(day, index) in weekProgress" 
                :key="index" 
                class="day-indicator"
                :class="{ completed: day.completed, today: day.isToday }"
                :title="day.date"
              >
                {{ day.dayName }}
              </div>
            </div>
            <span class="progress-text">{{ completedDays }}/{{ settings.weeklyGoal }}天</span>
          </div>
        </div>
        
        <div class="progress-card">
          <div class="progress-icon">🏆</div>
          <div class="progress-info">
            <h4>总体统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ totalSessions }}</span>
                <span class="stat-label">总次数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalMinutes }}</span>
                <span class="stat-label">总时长</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ streakDays }}</span>
                <span class="stat-label">连续天数</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 冥想完成弹窗 -->
    <div v-if="showCompletionModal" class="modal-overlay" @click="closeCompletionModal">
      <div class="completion-modal" @click.stop>
        <div class="modal-header">
          <h3>🎉 冥想完成</h3>
          <button class="close-btn" @click="closeCompletionModal">×</button>
        </div>
        
        <div class="modal-content">
          <p>恭喜您完成了 {{ currentMeditation.duration }} 分钟的冥想练习！</p>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">本次时长：</span>
              <span class="stat-value">{{ currentMeditation.duration }}分钟</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">今日总计：</span>
              <span class="stat-value">{{ todayMinutes }}分钟</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">连续天数：</span>
              <span class="stat-value">{{ streakDays }}天</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="secondary-btn" @click="closeCompletionModal">完成</button>
            <button class="primary-btn" @click="startNextMeditation">继续下一个</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useTrainingStore } from '../../stores';

const emit = defineEmits(['back']);

const trainingStore = useTrainingStore();

// 播放器状态
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(0);
const volume = ref(70);
const currentIndex = ref(0);

// 筛选状态
const selectedCategory = ref('all');
const selectedDuration = ref('all');

// 分类选项
const categories = ref([
  { value: 'all', label: '全部', icon: '🌟', description: '所有冥想类型' },
  { value: 'beginner', label: '初学者', icon: '🌱', description: '适合冥想新手的基础练习' },
  { value: 'mindfulness', label: '正念', icon: '🧘', description: '培养当下觉察和正念意识' },
  { value: 'relaxation', label: '放松', icon: '🌊', description: '身心放松和压力释放' },
  { value: 'focus', label: '专注', icon: '🎯', description: '提升注意力和专注能力' },
  { value: 'sleep', label: '睡眠', icon: '🌙', description: '改善睡眠质量和入睡速度' },
  { value: 'loving-kindness', label: '慈心', icon: '💝', description: '培养慈悲心和人际关系' },
  { value: 'creativity', label: '创造力', icon: '💡', description: '激发创造性思维和灵感' },
  { value: 'insight', label: '内观', icon: '🔍', description: '深度自我探索和智慧培养' },
  { value: 'healing', label: '疗愈', icon: '🌿', description: '情感疗愈和心理康复' },
  { value: 'energy', label: '能量', icon: '⚡', description: '提升活力和生命能量' },
  { value: 'chakra', label: '脉轮', icon: '🌈', description: '平衡和激活身体能量中心' }
]);

// 冥想设置
const settings = ref({
  // 提醒设置
  dailyReminder: false,
  reminderTime: '20:00',
  reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  reminderSound: 'gentle-bell',
  
  // 目标设置
  dailyGoal: 20,
  weeklyGoal: 140,
  monthlyGoal: 600,
  streakGoal: 7,
  
  // 播放设置
  autoPlay: false,
  autoPlayNext: false,
  fadeInOut: true,
  fadeInDuration: 5,
  fadeOutDuration: 10,
  backgroundMusic: false,
  backgroundMusicVolume: 30,
  backgroundMusicType: 'nature',
  
  // 个性化设置
  preferredDifficulty: 'beginner',
  preferredDuration: 15,
  preferredCategories: ['mindfulness', 'relaxation'],
  preferredInstructor: '',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  personalizedRecommendations: true,
  adaptiveDifficulty: false,
  moodBasedSelection: false,
  progressiveTraining: true,
  customPlaylist: [],
  favoriteInstructors: [],
  excludedCategories: [],
  
  // 界面设置
  darkMode: false,
  showProgress: true,
  showTimer: true,
  showBreathingGuide: true,
  vibrationFeedback: false,
  
  // 高级设置
  sessionPreparation: true,
  preparationTime: 30,
  sessionCooldown: true,
  cooldownTime: 60,
  biofeedbackIntegration: false,
  heartRateMonitoring: false
});

// 进度数据
const todayMinutes = ref(0);
const totalSessions = ref(0);
const totalMinutes = ref(0);
const streakDays = ref(0);
const completedDays = ref(0);

// 弹窗状态
const showCompletionModal = ref(false);

// 冥想音频数据
const meditations = ref([
  // 正念冥想系列
  {
    id: 1,
    title: '基础呼吸冥想',
    description: '通过专注呼吸来培养正念和专注力，适合初学者建立冥想基础',
    shortDescription: '基础冥想入门练习',
    duration: 10,
    difficulty: 'beginner',
    category: 'mindfulness',
    icon: '🫁',
    audioUrl: '/audio/meditation/basic-breathing.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['提升专注力', '减少焦虑', '改善呼吸'],
    instructor: '李静老师',
    tags: ['呼吸', '正念', '基础']
  },
  {
    id: 2,
    title: '进阶呼吸法',
    description: '学习4-7-8呼吸法和腹式呼吸，深化呼吸冥想体验',
    shortDescription: '深化呼吸冥想体验',
    duration: 15,
    difficulty: 'intermediate',
    category: 'mindfulness',
    icon: '🌬️',
    audioUrl: '/audio/meditation/advanced-breathing.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['深度放松', '调节神经系统', '提升睡眠质量'],
    instructor: '王明老师',
    tags: ['呼吸法', '放松', '进阶']
  },
  {
    id: 3,
    title: '正念观察',
    description: '培养对当下感受的觉察能力，不带评判地观察思维',
    shortDescription: '培养正念觉察',
    duration: 18,
    difficulty: 'intermediate',
    category: 'mindfulness',
    icon: '👁️',
    audioUrl: '/audio/meditation/mindful-observation.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['增强觉察力', '减少反应性', '提升情绪调节'],
    instructor: '张慧老师',
    tags: ['正念', '观察', '觉察']
  },
  
  // 身体放松系列
  {
    id: 4,
    title: '身体扫描冥想',
    description: '系统性地感知身体各个部位，释放肌肉紧张，提升身体觉察能力',
    shortDescription: '全身放松扫描',
    duration: 15,
    difficulty: 'beginner',
    category: 'relaxation',
    icon: '🧘‍♀️',
    audioUrl: '/audio/meditation/body-scan.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['肌肉放松', '身体觉察', '压力释放'],
    instructor: '陈安老师',
    tags: ['身体', '扫描', '放松']
  },
  {
    id: 5,
    title: '渐进式肌肉放松',
    description: '通过收紧和放松肌肉群来达到深度放松状态',
    shortDescription: '深度肌肉放松',
    duration: 25,
    difficulty: 'beginner',
    category: 'relaxation',
    icon: '💪',
    audioUrl: '/audio/meditation/progressive-relaxation.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['深度放松', '改善睡眠', '缓解疼痛'],
    instructor: '刘康老师',
    tags: ['肌肉', '渐进式', '深度放松']
  },
  {
    id: 6,
    title: '深度放松冥想',
    description: '释放身心压力，进入深度放松状态，缓解焦虑和紧张情绪',
    shortDescription: '深度放松身心',
    duration: 20,
    difficulty: 'intermediate',
    category: 'relaxation',
    icon: '🌊',
    audioUrl: '/audio/meditation/deep-relaxation.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['压力释放', '情绪平衡', '内心平静'],
    instructor: '瑜伽大师',
    tags: ['深度放松', '压力', '平静']
  },
  
  // 专注力训练系列
  {
    id: 7,
    title: '专注力提升冥想',
    description: '通过专注呼吸和身体感知，提升注意力集中能力，改善学习和工作效率',
    shortDescription: '提升专注力和注意力',
    duration: 12,
    difficulty: 'intermediate',
    category: 'focus',
    icon: '🎯',
    audioUrl: '/audio/meditation/focus-enhancement.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['提升专注力', '增强意志力', '改善工作效率'],
    instructor: '专注力导师',
    tags: ['专注', '单点', '训练']
  },
  {
    id: 8,
    title: '数息冥想',
    description: '通过数呼吸来训练心智的稳定性和专注力',
    shortDescription: '训练心智稳定',
    duration: 20,
    difficulty: 'intermediate',
    category: 'focus',
    icon: '🔢',
    audioUrl: '/audio/meditation/counting-breath.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['心智稳定', '专注持久', '内心平静'],
    instructor: '禅修老师',
    tags: ['数息', '专注', '稳定']
  },
  {
    id: 9,
    title: '视觉专注冥想',
    description: '通过观想光点或图像来训练视觉专注能力',
    shortDescription: '训练视觉专注',
    duration: 16,
    difficulty: 'advanced',
    category: 'focus',
    icon: '✨',
    audioUrl: '/audio/meditation/visual-focus.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['视觉专注', '想象力', '心智清晰'],
    instructor: '观想导师',
    tags: ['视觉', '观想', '专注']
  },
  
  // 慈心与情感系列
  {
    id: 10,
    title: '慈心冥想',
    description: '培养对自己和他人的慈悲心，增进人际关系',
    shortDescription: '培养慈悲心',
    duration: 20,
    difficulty: 'intermediate',
    category: 'mindfulness',
    icon: '💝',
    audioUrl: '/audio/meditation/loving-kindness.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['增进慈悲心', '改善人际关系', '减少负面情绪'],
    instructor: '慈心导师',
    tags: ['慈心', '慈悲', '人际']
  },
  {
    id: 11,
    title: '感恩冥想',
    description: '培养感恩的心态，增进生活的幸福感和满足感',
    shortDescription: '培养感恩心态',
    duration: 15,
    difficulty: 'beginner',
    category: 'mindfulness',
    icon: '🙏',
    audioUrl: '/audio/meditation/gratitude.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['增进幸福感', '积极心态', '生活满足'],
    instructor: '正向心理学家',
    tags: ['感恩', '幸福', '积极']
  },
  
  // 睡眠与恢复系列
  {
    id: 12,
    title: '助眠冥想',
    description: '温和的语音引导帮助您放松身心，更快进入睡眠状态，提升睡眠质量',
    shortDescription: '改善睡眠质量',
    duration: 22,
    difficulty: 'beginner',
    category: 'sleep',
    icon: '🌙',
    audioUrl: '/audio/meditation/sleep-aid.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['改善睡眠', '快速入睡', '睡眠质量'],
    instructor: '睡眠专家',
    tags: ['睡眠', '入睡', '夜晚']
  },
  {
    id: 13,
    title: '深度睡眠引导',
    description: '引导进入深度睡眠状态，促进身心恢复',
    shortDescription: '深度睡眠恢复',
    duration: 35,
    difficulty: 'beginner',
    category: 'sleep',
    icon: '😴',
    audioUrl: '/audio/meditation/deep-sleep.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['深度睡眠', '身心恢复', '免疫增强'],
    instructor: '睡眠治疗师',
    tags: ['深度睡眠', '恢复', '治疗']
  },
  {
    id: 14,
    title: '午休小憩',
    description: '短时间的放松冥想，适合午休或工作间隙',
    shortDescription: '快速恢复精力',
    duration: 8,
    difficulty: 'beginner',
    category: 'sleep',
    icon: '☀️',
    audioUrl: '/audio/meditation/power-nap.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['快速恢复', '提升精力', '工作效率'],
    instructor: '效率专家',
    tags: ['午休', '小憩', '恢复']
  },
  
  // 初学者专区
  {
    id: 15,
    title: '初学者引导冥想',
    description: '专为冥想初学者设计的基础引导练习，帮助您学习正确的冥想姿势和呼吸方法',
    shortDescription: '冥想入门指导',
    duration: 10,
    difficulty: 'beginner',
    category: 'beginner',
    icon: '🌱',
    audioUrl: '/audio/meditation/beginner-guide.mp3',
    completedCount: 0,
    lastPractice: null,
    benefits: ['学习基础', '建立习惯', '正确姿势'],
    instructor: '入门导师',
    tags: ['入门', '基础', '指导']
  }
]);

// 计算属性
const currentMeditation = computed(() => meditations.value[currentIndex.value]);

const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0;
  return (currentTime.value / totalTime.value) * 100;
});

const todayProgressPercentage = computed(() => {
  return Math.min((todayMinutes.value / settings.value.dailyGoal) * 100, 100);
});

const filteredMeditations = computed(() => {
  let filtered = meditations.value;
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(m => m.category === selectedCategory.value);
  }
  
  if (selectedDuration.value !== 'all') {
    filtered = filtered.filter(m => {
      switch (selectedDuration.value) {
        case 'short': return m.duration <= 10;
        case 'medium': return m.duration > 10 && m.duration <= 20;
        case 'long': return m.duration > 20;
        default: return true;
      }
    });
  }
  
  return filtered;
});

const weekProgress = computed(() => {
  const today = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const progress = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    
    progress.push({
      dayName: weekDays[i],
      date: date.toLocaleDateString(),
      completed: Math.random() > 0.5, // 模拟数据
      isToday: date.toDateString() === today.toDateString()
    });
  }
  
  return progress;
});

// 方法
const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startMeditation();
  } else {
    pauseMeditation();
  }
};

const startMeditation = () => {
  totalTime.value = currentMeditation.value.duration * 60; // 转换为秒
  // 这里应该实际播放音频文件
  console.log('开始播放:', currentMeditation.value.title);
};

const pauseMeditation = () => {
  // 暂停音频播放
  console.log('暂停播放');
};

const previousTrack = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    if (isPlaying.value) {
      startMeditation();
    }
  }
};

const nextTrack = () => {
  if (currentIndex.value < meditations.value.length - 1) {
    currentIndex.value++;
    if (isPlaying.value) {
      startMeditation();
    }
  }
};

const selectMeditation = (index) => {
  currentIndex.value = index;
  currentTime.value = 0;
  if (isPlaying.value) {
    startMeditation();
  }
};

const updateVolume = () => {
  // 更新音频音量
  console.log('音量设置为:', volume.value);
};

const filterMeditations = () => {
  // 筛选逻辑已在计算属性中实现
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatLastPractice = (date) => {
  if (!date) return '未练习';
  const now = new Date();
  const practice = new Date(date);
  const diffDays = Math.floor((now - practice) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return practice.toLocaleDateString();
};

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };
  return difficultyMap[difficulty] || '中级';
};

const closeCompletionModal = () => {
  showCompletionModal.value = false;
};

const startNextMeditation = () => {
  closeCompletionModal();
  nextTrack();
  togglePlayPause();
};

// 模拟冥想完成
const completeMeditation = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  
  // 更新统计数据
  const meditation = meditations.value[currentIndex.value];
  meditation.completedCount++;
  meditation.lastPractice = new Date().toISOString();
  
  todayMinutes.value += meditation.duration;
  totalSessions.value++;
  totalMinutes.value += meditation.duration;
  
  // 保存数据
  saveMeditationData();
  
  // 显示完成弹窗
  showCompletionModal.value = true;
};

// 数据持久化
const saveMeditationData = () => {
  const data = {
    meditations: meditations.value,
    settings: settings.value,
    stats: {
      todayMinutes: todayMinutes.value,
      totalSessions: totalSessions.value,
      totalMinutes: totalMinutes.value,
      streakDays: streakDays.value
    }
  };
  
  trainingStore.saveMeditationModuleData('guided-meditation', data);
};

const loadMeditationData = () => {
  const data = trainingStore.getMeditationModuleData('guided-meditation');
  
  if (data) {
    if (data.meditations) {
      meditations.value = data.meditations;
    }
    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings };
    }
    if (data.stats) {
      todayMinutes.value = data.stats.todayMinutes || 0;
      totalSessions.value = data.stats.totalSessions || 0;
      totalMinutes.value = data.stats.totalMinutes || 0;
      streakDays.value = data.stats.streakDays || 0;
    }
  }
};

// 生命周期
onMounted(() => {
  loadMeditationData();
  
  // 模拟音频播放进度
  const progressInterval = setInterval(() => {
    if (isPlaying.value && currentTime.value < totalTime.value) {
      currentTime.value++;
      
      // 模拟冥想完成
      if (currentTime.value >= totalTime.value) {
        completeMeditation();
      }
    }
  }, 1000);
  
  onUnmounted(() => {
    clearInterval(progressInterval);
  });
});
</script>

<style scoped>
.guided-meditation-container {
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

.meditation-player {
  margin-bottom: 3rem;
}

.player-card {
  background: var(--color-card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
}

.meditation-info {
  text-align: center;
  margin-bottom: 2rem;
}

.meditation-info h3 {
  color: var(--color-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.meditation-description {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.meditation-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.meditation-meta span {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.progress-container {
  margin-bottom: 1.5rem;
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

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
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

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
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

.meditation-library {
  margin-bottom: 3rem;
}

.meditation-library h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.library-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--color-text);
  font-weight: 600;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
}

.meditation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.meditation-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 2px solid transparent;
}

.meditation-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.meditation-card.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.meditation-icon {
  font-size: 2rem;
}

.play-indicator {
  font-size: 1.2rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.meditation-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.card-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-meta .duration {
  background: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-meta .difficulty {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.difficulty.beginner {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.difficulty.intermediate {
  background: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.difficulty.advanced {
  background: rgba(var(--color-danger-rgb), 0.1);
  color: var(--color-danger);
}

.card-stats {
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

.meditation-settings {
  margin-bottom: 3rem;
}

.meditation-settings h3 {
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

.time-input, .number-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
}

.meditation-progress h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.progress-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.progress-info {
  flex: 1;
}

.progress-info h4 {
  color: var(--color-primary);
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.progress-bar-container {
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.week-calendar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.day-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(var(--color-border-rgb), 0.3);
  color: var(--color-text-secondary);
}

.day-indicator.completed {
  background: var(--color-success);
  color: white;
}

.day-indicator.today {
  border: 2px solid var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stats-grid .stat-item {
  flex-direction: column;
  gap: 0.2rem;
}

.stats-grid .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.stats-grid .stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
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
  max-width: 400px;
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

.completion-stats {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.completion-stats .stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.completion-stats .stat-item:last-child {
  margin-bottom: 0;
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
  .guided-meditation-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .meditation-meta {
    gap: 1rem;
  }
  
  .library-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .meditation-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-overview {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>