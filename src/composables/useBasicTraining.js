/**
 * 基础训练模块通用组合式函数
 * 为所有基础训练模块提供统一的数据管理、设置保存和统计跟踪功能
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  getModuleSettings,
  saveModuleSettings,
  getModuleStats,
  saveModuleStats,
  updateModuleTrainingRecord
} from '@/services/basicTrainingStorage';

/**
 * 基础训练模块通用组合式函数
 * @param {string} moduleType - 模块类型
 * @param {Object} defaultSettings - 默认设置（可选）
 * @returns {Object} 训练管理对象
 */
export function useBasicTraining(moduleType, defaultSettings = {}) {
  // 响应式状态
  const isLoading = ref(true);
  const settings = reactive({});
  const stats = reactive({});
  const currentSession = reactive({
    startTime: null,
    endTime: null,
    duration: 0,
    score: null,
    completed: false,
    errors: 0,
    data: {}
  });
  
  // 训练状态
  const isTraining = ref(false);
  const isPaused = ref(false);
  const sessionTimer = ref(null);
  const selectedMode = ref('');
  const trainingTime = ref(0);
  
  // 训练进度数据
  const trainingProgress = reactive({});
  
  // 计算属性
  const formattedStats = computed(() => ({
    totalSessions: stats.totalSessions || 0,
    totalTimeFormatted: formatDuration(stats.totalTime || 0),
    bestScore: stats.bestScore || 0,
    averageScore: Math.round((stats.averageScore || 0) * 100) / 100,
    completionRate: Math.round((stats.completionRate || 0) * 100) / 100,
    recentTrend: getRecentTrend(),
    achievements: stats.achievements || [],
    weeklyData: stats.weeklyProgress || [],
    monthlyData: stats.monthlyProgress || []
  }));
  
  const sessionProgress = computed(() => {
    if (!currentSession.startTime) return 0;
    return currentSession.duration;
  });
  
  const canStartTraining = computed(() => {
    return !isTraining.value && !isLoading.value;
  });
  
  const canPauseTraining = computed(() => {
    return isTraining.value && !isPaused.value;
  });
  
  const canResumeTraining = computed(() => {
    return isTraining.value && isPaused.value;
  });
  
  /**
   * 初始化模块数据
   */
  async function initializeModule() {
    try {
      isLoading.value = true;
      
      // 加载设置
      const moduleSettings = await getModuleSettings(moduleType);
      Object.assign(settings, { ...moduleSettings, ...defaultSettings });
      
      // 加载统计数据
      const moduleStats = await getModuleStats(moduleType);
      Object.assign(stats, moduleStats);
      
      // 初始化训练进度数据
      const defaultProgress = {
        basic: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
        speed_fluency: 0,
        comprehension_fluency: 0,
        contextual_reading: 0
      };
      Object.assign(trainingProgress, defaultProgress);
      
    } catch (error) {
      console.error(`初始化${moduleType}模块失败:`, error);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * 保存设置
   * @param {Object} newSettings - 新设置
   */
  async function updateSettings(newSettings) {
    try {
      Object.assign(settings, newSettings);
      await saveModuleSettings(moduleType, settings);
      return true;
    } catch (error) {
      console.error(`保存${moduleType}模块设置失败:`, error);
      return false;
    }
  }
  
  /**
   * 开始训练会话
   * @param {Object} sessionData - 会话初始数据
   */
  function startTrainingSession(sessionData = {}) {
    if (isTraining.value) {
      console.warn('训练已在进行中');
      return;
    }
    
    // 重置会话数据
    Object.assign(currentSession, {
      startTime: new Date(),
      endTime: null,
      duration: 0,
      score: null,
      completed: false,
      errors: 0,
      data: { ...sessionData }
    });
    
    isTraining.value = true;
    isPaused.value = false;
    
    // 开始计时
    startSessionTimer();
    
    console.log(`开始${moduleType}训练会话`);
  }
  
  /**
   * 暂停训练
   */
  function pauseTraining() {
    if (!isTraining.value || isPaused.value) return;
    
    isPaused.value = true;
    stopSessionTimer();
    
    console.log(`暂停${moduleType}训练`);
  }
  
  /**
   * 恢复训练
   */
  function resumeTraining() {
    if (!isTraining.value || !isPaused.value) return;
    
    isPaused.value = false;
    startSessionTimer();
    
    console.log(`恢复${moduleType}训练`);
  }
  
  /**
   * 结束训练会话
   * @param {Object} sessionResult - 会话结果
   */
  async function endTrainingSession(sessionResult = {}) {
    if (!isTraining.value) {
      console.warn('没有进行中的训练会话');
      return;
    }
    
    // 停止计时
    stopSessionTimer();
    
    // 更新会话数据
    currentSession.endTime = new Date();
    currentSession.duration = Math.floor(
      (currentSession.endTime - currentSession.startTime) / 1000
    );
    
    Object.assign(currentSession, sessionResult);
    
    // 保存训练记录并更新统计
    try {
      const updatedStats = await updateModuleTrainingRecord(moduleType, {
        duration: currentSession.duration,
        score: currentSession.score,
        completed: currentSession.completed,
        errors: currentSession.errors,
        sessionData: currentSession.data,
        timestamp: currentSession.endTime.toISOString()
      });
      
      // 更新本地统计数据
      Object.assign(stats, updatedStats);
      
      console.log(`${moduleType}训练会话已结束并保存`);
    } catch (error) {
      console.error(`保存${moduleType}训练记录失败:`, error);
    }
    
    // 重置训练状态
    isTraining.value = false;
    isPaused.value = false;
  }
  
  /**
   * 取消训练会话
   */
  function cancelTrainingSession() {
    if (!isTraining.value) return;
    
    stopSessionTimer();
    isTraining.value = false;
    isPaused.value = false;
    
    // 重置会话数据
    Object.assign(currentSession, {
      startTime: null,
      endTime: null,
      duration: 0,
      score: null,
      completed: false,
      errors: 0,
      data: {}
    });
    
    console.log(`取消${moduleType}训练会话`);
  }
  
  /**
   * 更新会话数据
   * @param {Object} data - 要更新的数据
   */
  function updateSessionData(data) {
    Object.assign(currentSession.data, data);
  }
  
  /**
   * 增加错误计数
   * @param {number} count - 错误数量
   */
  function addError(count = 1) {
    currentSession.errors += count;
  }
  
  /**
   * 设置会话分数
   * @param {number} score - 分数
   */
  function setSessionScore(score) {
    currentSession.score = score;
  }
  
  /**
   * 标记会话完成
   * @param {boolean} completed - 是否完成
   */
  function markSessionCompleted(completed = true) {
    currentSession.completed = completed;
  }
  
  /**
   * 开始会话计时器
   */
  function startSessionTimer() {
    if (sessionTimer.value) {
      clearInterval(sessionTimer.value);
    }
    
    sessionTimer.value = setInterval(() => {
      if (currentSession.startTime && !isPaused.value) {
        currentSession.duration = Math.floor(
          (new Date() - currentSession.startTime) / 1000
        );
      }
    }, 1000);
  }
  
  /**
   * 停止会话计时器
   */
  function stopSessionTimer() {
    if (sessionTimer.value) {
      clearInterval(sessionTimer.value);
      sessionTimer.value = null;
    }
  }
  
  /**
   * 格式化时长
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时长
   */
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
  }
  
  /**
   * 获取最近趋势
   * @returns {string} 趋势描述
   */
  function getRecentTrend() {
    const trend = stats.improvementTrend || [];
    if (trend.length < 2) return 'stable';
    
    const recent = trend.slice(-5);
    const scores = recent.map(t => t.score).filter(s => s !== null && s !== undefined);
    
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'declining';
    return 'stable';
  }
  
  /**
   * 获取训练建议
   * @returns {Array} 建议列表
   */
  function getTrainingSuggestions() {
    const suggestions = [];
    
    // 基于统计数据生成建议
    if (stats.totalSessions < 5) {
      suggestions.push({
        type: 'beginner',
        title: '新手建议',
        content: '建议每天进行15-20分钟的训练，保持规律性有助于提高效果。'
      });
    }
    
    if (stats.completionRate < 80) {
      suggestions.push({
        type: 'completion',
        title: '完成率提升',
        content: '尝试降低难度或延长训练时间，提高训练完成率。'
      });
    }
    
    if (stats.averageScore < 60) {
      suggestions.push({
        type: 'performance',
        title: '成绩提升',
        content: '建议从基础难度开始，逐步提高训练强度。'
      });
    }
    
    const recentTrend = getRecentTrend();
    if (recentTrend === 'declining') {
      suggestions.push({
        type: 'trend',
        title: '状态调整',
        content: '最近表现有所下降，建议适当休息或调整训练方式。'
      });
    } else if (recentTrend === 'improving') {
      suggestions.push({
        type: 'trend',
        title: '保持状态',
        content: '最近表现不错，继续保持当前的训练节奏！'
      });
    }
    
    return suggestions;
  }
  
  /**
   * 重置模块数据
   * @param {boolean} keepSettings - 是否保留设置
   */
  async function resetModuleData(keepSettings = true) {
    try {
      if (!keepSettings) {
        const defaultModuleSettings = await getModuleSettings(moduleType);
        Object.assign(settings, defaultModuleSettings);
        await saveModuleSettings(moduleType, settings);
      }
      
      // 重置统计数据
      const defaultStats = {
        totalSessions: 0,
        totalTime: 0,
        bestScore: null,
        averageScore: null,
        lastSession: null,
        completionRate: 0,
        improvementTrend: [],
        achievements: [],
        weeklyProgress: [],
        monthlyProgress: []
      };
      
      Object.assign(stats, defaultStats);
      await saveModuleStats(moduleType, stats);
      
      console.log(`${moduleType}模块数据已重置`);
      return true;
    } catch (error) {
      console.error(`重置${moduleType}模块数据失败:`, error);
      return false;
    }
  }
  
  // 生命周期钩子
  onMounted(() => {
    initializeModule();
  });
  
  onUnmounted(() => {
    // 清理计时器
    stopSessionTimer();
    
    // 如果有未完成的训练会话，自动保存
    if (isTraining.value) {
      endTrainingSession({ completed: false });
    }
  });
  
  /**
   * 开始训练
   * @param {string} modeId - 训练模式ID
   */
  function startTraining(modeId) {
    selectedMode.value = modeId;
    startTrainingSession();
  }
  
  /**
   * 停止训练
   */
  function stopTraining() {
    endTrainingSession({ completed: true });
  }
  
  // 返回公共接口
  return {
    // 状态
    isLoading,
    settings,
    stats,
    currentSession,
    isTraining,
    isPaused,
    selectedMode,
    trainingTime,
    trainingProgress,
    
    // 计算属性
    formattedStats,
    sessionProgress,
    canStartTraining,
    canPauseTraining,
    canResumeTraining,
    
    // 方法
    initializeModule,
    updateSettings,
    startTraining,
    startTrainingSession,
    pauseTraining,
    resumeTraining,
    stopTraining,
    endTrainingSession,
    cancelTrainingSession,
    updateSessionData,
    addError,
    setSessionScore,
    markSessionCompleted,
    formatDuration,
    getTrainingSuggestions,
    resetModuleData
  };
}

/**
 * 基础训练设置组合式函数
 * @param {Object} trainingManager - 训练管理器
 * @returns {Object} 设置管理对象
 */
export function useBasicTrainingSettings(trainingManager) {
  const { settings, updateSettings } = trainingManager;
  
  // 常用设置更新方法
  const toggleSoundEffects = () => {
    updateSettings({ soundEffects: !settings.soundEffects });
  };
  
  const toggleVibration = () => {
    updateSettings({ vibration: !settings.vibration });
  };
  
  const toggleShowProgress = () => {
    updateSettings({ showProgress: !settings.showProgress });
  };
  
  const toggleAutoNext = () => {
    updateSettings({ autoNext: !settings.autoNext });
  };
  
  const setTheme = (theme) => {
    updateSettings({ theme });
  };
  
  return {
    settings,
    updateSettings,
    toggleSoundEffects,
    toggleVibration,
    toggleShowProgress,
    toggleAutoNext,
    setTheme
  };
}

/**
 * 基础训练统计组合式函数
 * @param {Object} trainingManager - 训练管理器
 * @returns {Object} 统计管理对象
 */
export function useBasicTrainingStats(trainingManager) {
  const { stats, formattedStats } = trainingManager;
  
  // 获取图表数据
  const getChartData = computed(() => {
    const weeklyData = stats.weeklyProgress || [];
    const monthlyData = stats.monthlyProgress || [];
    
    return {
      weekly: weeklyData.map(week => ({
        label: week.week,
        sessions: week.sessions,
        averageScore: week.averageScore,
        totalTime: week.totalTime
      })),
      monthly: monthlyData.map(month => ({
        label: month.month,
        sessions: month.sessions,
        averageScore: month.averageScore,
        totalTime: month.totalTime
      }))
    };
  });
  
  // 获取成就进度
  const getAchievementProgress = computed(() => {
    const achievements = stats.achievements || [];
    const totalPossibleAchievements = 6; // 基础成就数量
    
    return {
      unlocked: achievements.length,
      total: totalPossibleAchievements,
      percentage: (achievements.length / totalPossibleAchievements) * 100,
      recent: achievements.slice(-3)
    };
  });
  
  return {
    stats,
    formattedStats,
    getChartData,
    getAchievementProgress
  };
}