/**
 * 冥想训练数据持久化工具
 * 管理用户进度、偏好设置和训练历史
 */

// 存储键名常量
const STORAGE_KEYS = {
  USER_PROGRESS: 'meditation_user_progress',
  USER_PREFERENCES: 'meditation_user_preferences',
  SESSION_HISTORY: 'meditation_session_history',
  ACHIEVEMENTS: 'meditation_achievements',
  STATISTICS: 'meditation_statistics'
};

// 默认用户偏好设置
const DEFAULT_PREFERENCES = {
  // 音频设置
  volume: 0.7,
  soundEnabled: true,
  backgroundMusic: true,
  
  // 视觉设置
  animationEnabled: true,
  darkMode: false,
  visualEffects: true,
  
  // 训练设置
  defaultSessionDuration: 300, // 5分钟
  reminderEnabled: true,
  reminderTime: '20:00',
  autoSave: true,
  
  // 呼吸训练偏好
  preferredBreathingPattern: { inhale: 4, hold: 4, exhale: 4, pause: 1 },
  breathingGuideEnabled: true,
  
  // 脑波生成器偏好
  preferredFrequency: 10, // Alpha波
  binauralBeatsEnabled: true,
  
  // 节拍器偏好
  preferredTempo: 60,
  accentBeatEnabled: true
};

// 默认用户进度
const DEFAULT_PROGRESS = {
  totalSessions: 0,
  totalDuration: 0, // 总训练时长（秒）
  currentStreak: 0, // 连续训练天数
  longestStreak: 0,
  lastSessionDate: null,
  
  // 各模块进度
  breathing: {
    sessions: 0,
    duration: 0,
    completedPrograms: [],
    currentLevel: 1
  },
  brainwave: {
    sessions: 0,
    duration: 0,
    usedFrequencies: [],
    currentLevel: 1
  },
  metronome: {
    sessions: 0,
    duration: 0,
    tempoRange: { min: 60, max: 60 },
    currentLevel: 1
  },
  visualization: {
    sessions: 0,
    duration: 0,
    completedScenarios: [],
    currentLevel: 1
  },
  mindfulness: {
    sessions: 0,
    duration: 0,
    completedExercises: [],
    currentLevel: 1
  }
};

// 默认统计数据
const DEFAULT_STATISTICS = {
  weeklyStats: [],
  monthlyStats: [],
  favoriteModules: [],
  averageSessionDuration: 0,
  moodTracking: [],
  focusLevels: []
};

/**
 * 存储管理类
 */
class MeditationStorage {
  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
  }

  /**
   * 检查localStorage是否可用
   */
  checkLocalStorageAvailability() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage不可用，将使用内存存储');
      return false;
    }
  }

  /**
   * 获取存储的数据
   */
  getItem(key, defaultValue = null) {
    if (!this.isLocalStorageAvailable) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`获取存储数据失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 设置存储的数据
   */
  setItem(key, value) {
    if (!this.isLocalStorageAvailable) {
      console.warn('localStorage不可用，数据未保存');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`保存存储数据失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除存储的数据
   */
  removeItem(key) {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`删除存储数据失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 清空所有冥想相关数据
   */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // ==================== 用户偏好设置 ====================

  /**
   * 获取用户偏好设置
   */
  getPreferences() {
    const preferences = this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }

  /**
   * 保存用户偏好设置
   */
  savePreferences(preferences) {
    const currentPreferences = this.getPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    return this.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  }

  /**
   * 更新单个偏好设置
   */
  updatePreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.savePreferences(preferences);
  }

  // ==================== 用户进度 ====================

  /**
   * 获取用户进度
   */
  getProgress() {
    const progress = this.getItem(STORAGE_KEYS.USER_PROGRESS, DEFAULT_PROGRESS);
    return { ...DEFAULT_PROGRESS, ...progress };
  }

  /**
   * 保存用户进度
   */
  saveProgress(progress) {
    const currentProgress = this.getProgress();
    const updatedProgress = { ...currentProgress, ...progress };
    return this.setItem(STORAGE_KEYS.USER_PROGRESS, updatedProgress);
  }

  /**
   * 更新训练会话完成
   */
  updateSessionComplete(module, duration, additionalData = {}) {
    const progress = this.getProgress();
    const today = new Date().toDateString();
    
    // 更新总体进度
    progress.totalSessions++;
    progress.totalDuration += duration;
    
    // 更新连续训练天数
    if (progress.lastSessionDate !== today) {
      if (progress.lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
        progress.currentStreak++;
      } else {
        progress.currentStreak = 1;
      }
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
      progress.lastSessionDate = today;
    }
    
    // 更新模块特定进度
    if (progress[module]) {
      progress[module].sessions++;
      progress[module].duration += duration;
      
      // 合并额外数据
      Object.assign(progress[module], additionalData);
    }
    
    return this.saveProgress(progress);
  }

  // ==================== 会话历史 ====================

  /**
   * 获取会话历史
   */
  getSessionHistory(limit = 50) {
    const history = this.getItem(STORAGE_KEYS.SESSION_HISTORY, []);
    return history.slice(-limit); // 返回最近的记录
  }

  /**
   * 添加会话记录
   */
  addSessionRecord(sessionData) {
    const history = this.getSessionHistory();
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...sessionData
    };
    
    history.push(record);
    
    // 保持最多100条记录
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    return this.setItem(STORAGE_KEYS.SESSION_HISTORY, history);
  }

  /**
   * 获取特定模块的会话历史
   */
  getModuleSessionHistory(module, limit = 20) {
    const history = this.getSessionHistory();
    return history
      .filter(session => session.module === module)
      .slice(-limit);
  }

  // ==================== 成就系统 ====================

  /**
   * 获取用户成就
   */
  getAchievements() {
    return this.getItem(STORAGE_KEYS.ACHIEVEMENTS, []);
  }

  /**
   * 解锁成就
   */
  unlockAchievement(achievementId) {
    const achievements = this.getAchievements();
    if (!achievements.find(a => a.id === achievementId)) {
      achievements.push({
        id: achievementId,
        unlockedAt: new Date().toISOString()
      });
      this.setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
      return true;
    }
    return false;
  }

  /**
   * 检查是否已解锁成就
   */
  hasAchievement(achievementId) {
    const achievements = this.getAchievements();
    return achievements.some(a => a.id === achievementId);
  }

  // ==================== 统计数据 ====================

  /**
   * 获取统计数据
   */
  getStatistics() {
    const stats = this.getItem(STORAGE_KEYS.STATISTICS, DEFAULT_STATISTICS);
    return { ...DEFAULT_STATISTICS, ...stats };
  }

  /**
   * 更新统计数据
   */
  updateStatistics(newStats) {
    const currentStats = this.getStatistics();
    const updatedStats = { ...currentStats, ...newStats };
    return this.setItem(STORAGE_KEYS.STATISTICS, updatedStats);
  }

  /**
   * 添加心情记录
   */
  addMoodRecord(mood, notes = '') {
    const stats = this.getStatistics();
    stats.moodTracking.push({
      date: new Date().toISOString(),
      mood,
      notes
    });
    
    // 保持最多30天的记录
    if (stats.moodTracking.length > 30) {
      stats.moodTracking.splice(0, stats.moodTracking.length - 30);
    }
    
    return this.updateStatistics(stats);
  }

  /**
   * 添加专注度记录
   */
  addFocusRecord(level, module) {
    const stats = this.getStatistics();
    stats.focusLevels.push({
      date: new Date().toISOString(),
      level,
      module
    });
    
    // 保持最多50条记录
    if (stats.focusLevels.length > 50) {
      stats.focusLevels.splice(0, stats.focusLevels.length - 50);
    }
    
    return this.updateStatistics(stats);
  }

  /**
   * 保存会话数据
   */
  saveSession(sessionData) {
    const sessions = this.getSessionHistory();
    sessions.push({
      ...sessionData,
      savedAt: Date.now()
    });
    this.setItem(STORAGE_KEYS.SESSION_HISTORY, sessions);
  }

  /**
   * 更新会话数据
   */
  updateSession(sessionData) {
    const sessions = this.getSessionHistory();
    const index = sessions.findIndex(session => session.id === sessionData.id);
    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        ...sessionData,
        updatedAt: Date.now()
      };
      this.setItem(STORAGE_KEYS.SESSION_HISTORY, sessions);
    }
  }

  // ==================== 数据导出/导入 ====================

  /**
   * 导出所有数据
   */
  exportData() {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = this.getItem(storageKey);
    });
    return data;
  }

  /**
   * 导入数据
   */
  importData(data) {
    try {
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (data[key]) {
          this.setItem(storageKey, data[key]);
        }
      });
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const meditationStorage = new MeditationStorage();

// 导出工具函数
export const {
  getPreferences,
  savePreferences,
  updatePreference,
  getProgress,
  saveProgress,
  updateSessionComplete,
  getSessionHistory,
  addSessionRecord,
  getModuleSessionHistory,
  getAchievements,
  unlockAchievement,
  hasAchievement,
  getStatistics,
  updateStatistics,
  addMoodRecord,
  addFocusRecord,
  exportData,
  importData,
  clearAll
} = meditationStorage;

export default meditationStorage;