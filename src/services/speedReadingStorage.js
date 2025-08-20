/**
 * 速读训练数据存储服务
 * 为速读训练模块提供统一的数据持久化和统计功能
 */

import { 
  getUserSettings, 
  saveUserSettings,
  getTrainingStats,
  saveTrainingStats,
  addSpeedReadingRecord
} from './storage';

// 速读训练存储键名
const SPEED_READING_KEYS = {
  ARTICLE_READING_HISTORY: 'articleReadingHistory',
  ARTICLE_READING_SETTINGS: 'articleReadingSettings',
  THREED_READING_HISTORY: 'threeDReadingHistory',
  THREED_READING_SETTINGS: 'threeDReadingSettings',
  SPEED_READING_STATS: 'speedReadingStats'
};

/**
 * 获取默认的文章阅读设置
 */
function getDefaultArticleSettings() {
  return {
    readingSpeed: 300,
    displayMode: 'word',
    fontSize: 'medium',
    lineHeight: 'normal',
    wordSpacing: 'normal',
    backgroundColor: 'white',
    highlightColor: '#007bff',
    showProgress: true,
    enableSound: false,
    autoAdjustSpeed: false,
    minSpeed: 100,
    maxSpeed: 1000
  };
}

/**
 * 获取默认的3D阅读设置
 */
function getDefaultThreeDSettings() {
  return {
    initialDisplayTime: 3,
    imageSize: 'medium',
    showFocusGuide: true,
    showTips: true,
    backgroundColor: 'black',
    enableSound: false,
    difficulty: 'medium',
    layerSeparation: 20,
    animationSpeed: 'normal',
    contrastLevel: 'medium',
    blurEffect: false,
    rotationEffect: false,
    pulseEffect: false,
    autoAdjustDifficulty: false,
    minDisplayTime: 1,
    maxDisplayTime: 10,
    feedbackType: 'visual'
  };
}

/**
 * 获取默认的速读统计数据
 */
function getDefaultSpeedReadingStats() {
  return {
    // 文章阅读统计
    articleReading: {
      totalSessions: 0,
      averageSpeed: 0,
      averageAccuracy: 0,
      totalTime: 0,
      bestSpeed: 0,
      speedLevel: 0,
      comprehensionLevel: 0,
      focusLevel: 0
    },
    // 3D阅读统计
    threeDReading: {
      totalSessions: 0,
      averageAccuracy: 0,
      averageTime: 0,
      totalTime: 0,
      stereoVision: 0,
      spatialPerception: 0,
      depthPerception: 0,
      visualFocus: 0
    },
    // 综合统计
    overall: {
      totalTrainingTime: 0,
      totalSessions: 0,
      lastTrainingDate: null,
      weeklyGoal: 300, // 分钟
      monthlyGoal: 1200 // 分钟
    }
  };
}

/**
 * 保存文章阅读设置
 * @param {Object} settings - 设置对象
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveArticleReadingSettings(settings) {
  try {
    localStorage.setItem(SPEED_READING_KEYS.ARTICLE_READING_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存文章阅读设置失败:', error);
    return false;
  }
}

/**
 * 获取文章阅读设置
 * @returns {Promise<Object>} 设置对象
 */
export async function getArticleReadingSettings() {
  try {
    const saved = localStorage.getItem(SPEED_READING_KEYS.ARTICLE_READING_SETTINGS);
    return saved ? { ...getDefaultArticleSettings(), ...JSON.parse(saved) } : getDefaultArticleSettings();
  } catch (error) {
    console.error('获取文章阅读设置失败:', error);
    return getDefaultArticleSettings();
  }
}

/**
 * 保存3D阅读设置
 * @param {Object} settings - 设置对象
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveThreeDReadingSettings(settings) {
  try {
    localStorage.setItem(SPEED_READING_KEYS.THREED_READING_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存3D阅读设置失败:', error);
    return false;
  }
}

/**
 * 获取3D阅读设置
 * @returns {Promise<Object>} 设置对象
 */
export async function getThreeDReadingSettings() {
  try {
    const saved = localStorage.getItem(SPEED_READING_KEYS.THREED_READING_SETTINGS);
    return saved ? { ...getDefaultThreeDSettings(), ...JSON.parse(saved) } : getDefaultThreeDSettings();
  } catch (error) {
    console.error('获取3D阅读设置失败:', error);
    return getDefaultThreeDSettings();
  }
}

/**
 * 保存文章阅读训练记录
 * @param {Object} record - 训练记录
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveArticleReadingRecord(record) {
  try {
    const history = await getArticleReadingHistory();
    const newRecord = {
      ...record,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [newRecord, ...history].slice(0, 100); // 只保留最近100条记录
    localStorage.setItem(SPEED_READING_KEYS.ARTICLE_READING_HISTORY, JSON.stringify(newHistory));
    
    // 更新统计数据
    await updateArticleReadingStats(newRecord);
    
    return true;
  } catch (error) {
    console.error('保存文章阅读记录失败:', error);
    return false;
  }
}

/**
 * 获取文章阅读历史记录
 * @returns {Promise<Array>} 历史记录数组
 */
export async function getArticleReadingHistory() {
  try {
    const history = localStorage.getItem(SPEED_READING_KEYS.ARTICLE_READING_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('获取文章阅读历史失败:', error);
    return [];
  }
}

/**
 * 保存3D阅读训练记录
 * @param {Object} record - 训练记录
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveThreeDReadingRecord(record) {
  try {
    const history = await getThreeDReadingHistory();
    const newRecord = {
      ...record,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [newRecord, ...history].slice(0, 100); // 只保留最近100条记录
    localStorage.setItem(SPEED_READING_KEYS.THREED_READING_HISTORY, JSON.stringify(newHistory));
    
    // 更新统计数据
    await updateThreeDReadingStats(newRecord);
    
    return true;
  } catch (error) {
    console.error('保存3D阅读记录失败:', error);
    return false;
  }
}

/**
 * 获取3D阅读历史记录
 * @returns {Promise<Array>} 历史记录数组
 */
export async function getThreeDReadingHistory() {
  try {
    const history = localStorage.getItem(SPEED_READING_KEYS.THREED_READING_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('获取3D阅读历史失败:', error);
    return [];
  }
}

/**
 * 更新文章阅读统计数据
 * @param {Object} record - 训练记录
 * @returns {Promise<boolean>} 更新是否成功
 */
export async function updateArticleReadingStats(record) {
  try {
    const stats = await getSpeedReadingStats();
    const articleStats = stats.articleReading;
    
    // 更新会话数
    articleStats.totalSessions += 1;
    
    // 更新平均速度
    if (articleStats.totalSessions === 1) {
      articleStats.averageSpeed = record.speed;
    } else {
      articleStats.averageSpeed = (
        (articleStats.averageSpeed * (articleStats.totalSessions - 1) + record.speed) / 
        articleStats.totalSessions
      );
    }
    
    // 更新平均准确率
    if (articleStats.totalSessions === 1) {
      articleStats.averageAccuracy = record.accuracy;
    } else {
      articleStats.averageAccuracy = (
        (articleStats.averageAccuracy * (articleStats.totalSessions - 1) + record.accuracy) / 
        articleStats.totalSessions
      );
    }
    
    // 更新最佳速度
    if (!articleStats.bestSpeed || record.speed > articleStats.bestSpeed) {
      articleStats.bestSpeed = record.speed;
    }
    
    // 更新总时间
    articleStats.totalTime += record.time;
    
    // 计算能力等级
    articleStats.speedLevel = Math.min(100, (articleStats.averageSpeed / 500) * 100);
    articleStats.comprehensionLevel = articleStats.averageAccuracy;
    articleStats.focusLevel = Math.min(100, (articleStats.totalSessions / 50) * 100);
    
    // 更新综合统计
    stats.overall.totalSessions += 1;
    stats.overall.totalTrainingTime += record.time;
    stats.overall.lastTrainingDate = new Date().toISOString();
    
    await saveSpeedReadingStats(stats);
    return true;
  } catch (error) {
    console.error('更新文章阅读统计失败:', error);
    return false;
  }
}

/**
 * 更新3D阅读统计数据
 * @param {Object} record - 训练记录
 * @returns {Promise<boolean>} 更新是否成功
 */
export async function updateThreeDReadingStats(record) {
  try {
    const stats = await getSpeedReadingStats();
    const threeDStats = stats.threeDReading;
    
    // 更新会话数
    threeDStats.totalSessions += 1;
    
    // 更新平均准确率
    if (threeDStats.totalSessions === 1) {
      threeDStats.averageAccuracy = record.accuracy;
    } else {
      threeDStats.averageAccuracy = (
        (threeDStats.averageAccuracy * (threeDStats.totalSessions - 1) + record.accuracy) / 
        threeDStats.totalSessions
      );
    }
    
    // 更新平均时间
    if (threeDStats.totalSessions === 1) {
      threeDStats.averageTime = record.averageTime;
    } else {
      threeDStats.averageTime = (
        (threeDStats.averageTime * (threeDStats.totalSessions - 1) + record.averageTime) / 
        threeDStats.totalSessions
      );
    }
    
    // 更新总时间
    threeDStats.totalTime += record.totalTime;
    
    // 计算各项能力指标
    threeDStats.stereoVision = Math.min(100, threeDStats.averageAccuracy);
    threeDStats.spatialPerception = Math.min(100, (threeDStats.totalSessions / 20) * 100);
    threeDStats.depthPerception = Math.min(100, Math.max(0, 100 - (threeDStats.averageTime - 3) * 20));
    threeDStats.visualFocus = Math.min(100, (threeDStats.stereoVision + threeDStats.depthPerception) / 2);
    
    // 更新综合统计
    stats.overall.totalSessions += 1;
    stats.overall.totalTrainingTime += record.totalTime;
    stats.overall.lastTrainingDate = new Date().toISOString();
    
    await saveSpeedReadingStats(stats);
    return true;
  } catch (error) {
    console.error('更新3D阅读统计失败:', error);
    return false;
  }
}

/**
 * 获取速读训练统计数据
 * @returns {Promise<Object>} 统计数据对象
 */
export async function getSpeedReadingStats() {
  try {
    const stats = localStorage.getItem(SPEED_READING_KEYS.SPEED_READING_STATS);
    return stats ? { ...getDefaultSpeedReadingStats(), ...JSON.parse(stats) } : getDefaultSpeedReadingStats();
  } catch (error) {
    console.error('获取速读统计数据失败:', error);
    return getDefaultSpeedReadingStats();
  }
}

/**
 * 保存速读训练统计数据
 * @param {Object} stats - 统计数据对象
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveSpeedReadingStats(stats) {
  try {
    localStorage.setItem(SPEED_READING_KEYS.SPEED_READING_STATS, JSON.stringify(stats));
    return true;
  } catch (error) {
    console.error('保存速读统计数据失败:', error);
    return false;
  }
}

/**
 * 获取训练进度分析
 * @param {number} days - 分析天数，默认30天
 * @returns {Promise<Object>} 进度分析数据
 */
export async function getTrainingProgress(days = 30) {
  try {
    const articleHistory = await getArticleReadingHistory();
    const threeDHistory = await getThreeDReadingHistory();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // 筛选指定天数内的记录
    const recentArticleRecords = articleHistory.filter(record => 
      new Date(record.timestamp) >= cutoffDate
    );
    const recentThreeDRecords = threeDHistory.filter(record => 
      new Date(record.timestamp) >= cutoffDate
    );
    
    // 计算趋势数据
    const speedTrend = calculateSpeedTrend(recentArticleRecords);
    const accuracyTrend = calculateAccuracyTrend([...recentArticleRecords, ...recentThreeDRecords]);
    const trainingFrequency = calculateTrainingFrequency([...recentArticleRecords, ...recentThreeDRecords], days);
    
    return {
      speedTrend,
      accuracyTrend,
      trainingFrequency,
      totalSessions: recentArticleRecords.length + recentThreeDRecords.length,
      averageSessionsPerWeek: ((recentArticleRecords.length + recentThreeDRecords.length) / days) * 7
    };
  } catch (error) {
    console.error('获取训练进度失败:', error);
    return {
      speedTrend: [],
      accuracyTrend: [],
      trainingFrequency: [],
      totalSessions: 0,
      averageSessionsPerWeek: 0
    };
  }
}

/**
 * 计算速度趋势
 * @param {Array} records - 文章阅读记录
 * @returns {Array} 速度趋势数据
 */
function calculateSpeedTrend(records) {
  const trendData = [];
  const groupedByDate = {};
  
  records.forEach(record => {
    const date = new Date(record.timestamp).toDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(record.speed);
  });
  
  Object.keys(groupedByDate).sort().forEach(date => {
    const speeds = groupedByDate[date];
    const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    trendData.push({
      date,
      speed: Math.round(averageSpeed),
      sessions: speeds.length
    });
  });
  
  return trendData;
}

/**
 * 计算准确率趋势
 * @param {Array} records - 训练记录
 * @returns {Array} 准确率趋势数据
 */
function calculateAccuracyTrend(records) {
  const trendData = [];
  const groupedByDate = {};
  
  records.forEach(record => {
    const date = new Date(record.timestamp).toDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(record.accuracy);
  });
  
  Object.keys(groupedByDate).sort().forEach(date => {
    const accuracies = groupedByDate[date];
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    trendData.push({
      date,
      accuracy: Math.round(averageAccuracy),
      sessions: accuracies.length
    });
  });
  
  return trendData;
}

/**
 * 计算训练频率
 * @param {Array} records - 训练记录
 * @param {number} days - 天数
 * @returns {Array} 训练频率数据
 */
function calculateTrainingFrequency(records, days) {
  const frequencyData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const dayRecords = records.filter(record => 
      new Date(record.timestamp).toDateString() === dateString
    );
    
    frequencyData.push({
      date: dateString,
      sessions: dayRecords.length,
      totalTime: dayRecords.reduce((sum, record) => sum + (record.time || record.totalTime || 0), 0)
    });
  }
  
  return frequencyData;
}

/**
 * 清除所有速读训练数据
 * @returns {Promise<boolean>} 清除是否成功
 */
export async function clearAllSpeedReadingData() {
  try {
    Object.values(SPEED_READING_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('清除速读训练数据失败:', error);
    return false;
  }
}

/**
 * 导出速读训练数据
 * @returns {Promise<Object>} 导出的数据对象
 */
export async function exportSpeedReadingData() {
  try {
    const data = {
      articleReadingHistory: await getArticleReadingHistory(),
      threeDReadingHistory: await getThreeDReadingHistory(),
      articleReadingSettings: await getArticleReadingSettings(),
      threeDReadingSettings: await getThreeDReadingSettings(),
      speedReadingStats: await getSpeedReadingStats(),
      exportDate: new Date().toISOString()
    };
    return data;
  } catch (error) {
    console.error('导出速读训练数据失败:', error);
    throw error;
  }
}

/**
 * 导入速读训练数据
 * @param {Object} data - 要导入的数据
 * @returns {Promise<boolean>} 导入是否成功
 */
export async function importSpeedReadingData(data) {
  try {
    if (data.articleReadingHistory) {
      localStorage.setItem(SPEED_READING_KEYS.ARTICLE_READING_HISTORY, JSON.stringify(data.articleReadingHistory));
    }
    if (data.threeDReadingHistory) {
      localStorage.setItem(SPEED_READING_KEYS.THREED_READING_HISTORY, JSON.stringify(data.threeDReadingHistory));
    }
    if (data.articleReadingSettings) {
      await saveArticleReadingSettings(data.articleReadingSettings);
    }
    if (data.threeDReadingSettings) {
      await saveThreeDReadingSettings(data.threeDReadingSettings);
    }
    if (data.speedReadingStats) {
      await saveSpeedReadingStats(data.speedReadingStats);
    }
    return true;
  } catch (error) {
    console.error('导入速读训练数据失败:', error);
    return false;
  }
}