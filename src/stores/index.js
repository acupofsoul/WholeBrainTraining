import { defineStore } from 'pinia';
import { 
  getUserSettings, 
  saveUserSettings,
  getTrainingStats,
  saveTrainingStats,
  getSchulteHistory,
  getSpeedReadingHistory,
  getFlashVisionHistory,
  getMeditationData,
  saveMeditationData
} from '../services/storage';

// 用户设置存储
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 应用设置
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: true,
    
    // 舒尔特表设置
    schulteSettings: {
      defaultSize: 5,
      defaultContentType: 'numbers',
      defaultColorMode: 'normal',
      highlightNext: false
    },
    
    // 速读设置
    speedReadingSettings: {
      defaultSpeed: 300,
      defaultDisplayMode: 'word',
      defaultTextIndex: 0
    },
    
    // 闪视设置
    flashVisionSettings: {
      defaultDisplayTime: 300,
      defaultContentType: 'numbers',
      defaultDifficulty: 'easy'
    },
    
    // 数据管理设置
    dataManagement: {
      autoBackup: false,
      backupFrequency: 'weekly',
      lastBackup: null
    },
    
    // 加载状态
    isLoaded: false
  }),
  
  actions: {
    // 初始化设置
    async initSettings() {
      try {
        const settings = await getUserSettings();
        
        // 确保数据管理设置存在
        if (!settings.dataManagement) {
          settings.dataManagement = this.$state.dataManagement;
        }
        
        this.$patch(settings);
        this.isLoaded = true;
        this.applyTheme();
        return settings;
      } catch (error) {
        console.error('初始化设置失败:', error);
        this.isLoaded = true;
        return null;
      }
    },
    
    // 保存设置
    async saveSettings() {
      try {
        const settingsToSave = {
          theme: this.theme,
          soundEnabled: this.soundEnabled,
          notificationsEnabled: this.notificationsEnabled,
          schulteSettings: this.schulteSettings,
          speedReadingSettings: this.speedReadingSettings,
          flashVisionSettings: this.flashVisionSettings
        };
        
        await saveUserSettings(settingsToSave);
        this.applyTheme();
        return true;
      } catch (error) {
        console.error('保存设置失败:', error);
        return false;
      }
    },
    
    // 应用主题
    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else if (this.theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      } else if (this.theme === 'auto') {
        // 根据系统主题设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        }
      }
    }
  }
});

// 训练数据存储
export const useTrainingStore = defineStore('training', {
  state: () => ({
    // 总体统计
    stats: {
      totalSessions: 0,
      totalTime: 0,
      lastSession: null,
      moduleStats: {
        schulte: {
          sessions: 0,
          bestTime: null,
          averageTime: null
        },
        speedReading: {
          sessions: 0,
          highestSpeed: null,
          averageSpeed: null,
          averageComprehension: null
        },
        flashVision: {
          sessions: 0,
          highestAccuracy: null,
          averageAccuracy: null,
          fastestResponseTime: null
        }
      }
    },
    
    // 历史记录
    schulteHistory: [],
    speedReadingHistory: [],
    flashVisionHistory: [],
    
    // 冥想模块数据
    meditationData: {
      guidedMeditation: {
        settings: {},
        meditations: [],
        progress: {},
        analytics: {}
      },
      brainwaveGenerator: {
        settings: {},
        waves: [],
        programs: [],
        analytics: {}
      },
      metronome: {
        settings: {},
        modes: [],
        analytics: {}
      }
    },
    
    // 加载状态
    isLoaded: false
  }),
  
  getters: {
    // 获取最近的训练记录
    recentTrainings() {
      const schulte = this.schulteHistory.slice(0, 5);
      const speedReading = this.speedReadingHistory.slice(0, 5);
      const flashVision = this.flashVisionHistory.slice(0, 5);
      
      return {
        schulte,
        speedReading,
        flashVision
      };
    },
    
    // 获取总训练时间（格式化）
    formattedTotalTime() {
      const totalSeconds = this.stats.totalTime;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      return `${hours}小时${minutes}分钟${seconds}秒`;
    },
    
    // 获取总训练次数
    totalSessions() {
      return this.stats.totalSessions;
    },
    
    // 获取最后训练时间（格式化）
    lastSessionFormatted() {
      if (!this.stats.lastSession) return '无记录';
      
      const date = new Date(this.stats.lastSession);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  
  actions: {
    // 初始化训练数据
    async initTrainingData() {
      try {
        // 加载统计数据
        const stats = await getTrainingStats();
        this.stats = stats;
        
        // 加载历史记录
        const [schulteHistory, speedReadingHistory, flashVisionHistory] = await Promise.all([
          getSchulteHistory(),
          getSpeedReadingHistory(),
          getFlashVisionHistory()
        ]);
        
        this.schulteHistory = schulteHistory;
        this.speedReadingHistory = speedReadingHistory;
        this.flashVisionHistory = flashVisionHistory;
        
        this.isLoaded = true;
        return true;
      } catch (error) {
        console.error('初始化训练数据失败:', error);
        this.isLoaded = true;
        return false;
      }
    },
    
    // 更新统计数据
    async updateStats(stats) {
      try {
        this.stats = stats;
        await saveTrainingStats(stats);
        return true;
      } catch (error) {
        console.error('更新统计数据失败:', error);
        return false;
      }
    },
    
    // 更新舒尔特表历史记录
    updateSchulteHistory(history) {
      this.schulteHistory = history;
    },
    
    // 更新速读历史记录
    updateSpeedReadingHistory(history) {
      this.speedReadingHistory = history;
    },
    
    // 更新闪视历史记录
    updateFlashVisionHistory(history) {
      this.flashVisionHistory = history;
    },
    
    // 冥想模块数据管理
    async initMeditationData() {
      try {
        const data = await getMeditationData();
        if (data) {
          this.meditationData = { ...this.meditationData, ...data };
        }
        return true;
      } catch (error) {
        console.error('初始化冥想数据失败:', error);
        return false;
      }
    },
    
    // 保存冥想模块数据
    async saveMeditationModuleData(module, data) {
      try {
        this.meditationData[module] = { ...this.meditationData[module], ...data };
        await saveMeditationData(this.meditationData);
        return true;
      } catch (error) {
        console.error(`保存${module}数据失败:`, error);
        return false;
      }
    },
    
    // 获取冥想模块数据
    getMeditationModuleData(module) {
      return this.meditationData[module] || {};
    },
    
    // 更新冥想统计数据
    async updateMeditationStats(module, stats) {
      try {
        if (!this.meditationData[module]) {
          this.meditationData[module] = {};
        }
        if (!this.meditationData[module].analytics) {
          this.meditationData[module].analytics = {};
        }
        
        this.meditationData[module].analytics = {
          ...this.meditationData[module].analytics,
          ...stats
        };
        
        await saveMeditationData(this.meditationData);
        return true;
      } catch (error) {
        console.error(`更新${module}统计数据失败:`, error);
        return false;
      }
    },
    
    // 添加冥想会话记录
    async addMeditationSession(module, sessionData) {
      try {
        if (!this.meditationData[module]) {
          this.meditationData[module] = {};
        }
        if (!this.meditationData[module].sessions) {
          this.meditationData[module].sessions = [];
        }
        
        const session = {
          ...sessionData,
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        };
        
        this.meditationData[module].sessions.unshift(session);
        
        // 只保留最近100条记录
        if (this.meditationData[module].sessions.length > 100) {
          this.meditationData[module].sessions = this.meditationData[module].sessions.slice(0, 100);
        }
        
        await saveMeditationData(this.meditationData);
        return true;
      } catch (error) {
        console.error(`添加${module}会话记录失败:`, error);
        return false;
      }
    }
  }
});