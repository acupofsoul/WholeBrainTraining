/**
 * 本地数据存储服务
 * 使用localforage库实现本地数据的持久化存储
 */

import localforage from 'localforage';

// 配置localforage
localforage.config({
  name: 'WholeBrainTraining',
  storeName: 'training_data',
  description: '全脑训练工具的本地数据存储'
});

// 存储键名常量
const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  TRAINING_STATS: 'training_stats',
  SCHULTE_HISTORY: 'schulte_history',
  SPEED_READING_HISTORY: 'speed_reading_history',
  FLASH_VISION_HISTORY: 'flash_vision_history',
  MEDITATION_DATA: 'meditation_data',
  AUTO_BACKUP: 'auto_backup',
  LAST_BACKUP_DATE: 'last_backup_date'
};

/**
 * 保存用户设置
 * @param {Object} settings - 用户设置对象
 * @returns {Promise<Object>} - 保存的设置对象
 */
export async function saveUserSettings(settings) {
  try {
    await localforage.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
    return settings;
  } catch (error) {
    console.error('保存用户设置失败:', error);
    throw error;
  }
}

/**
 * 获取用户设置
 * @returns {Promise<Object>} - 用户设置对象
 */
export async function getUserSettings() {
  try {
    const settings = await localforage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return settings || getDefaultSettings();
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return getDefaultSettings();
  }
}

/**
 * 获取默认设置
 * @returns {Object} - 默认设置对象
 */
export function getDefaultSettings() {
  return {
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: true,
    dataManagement: {
      autoBackupEnabled: true,
      backupInterval: 1 // 天
    }
  };
}

/**
 * 保存训练统计数据
 * @param {Object} stats - 训练统计数据
 * @returns {Promise<Object>} - 保存的统计数据
 */
export async function saveTrainingStats(stats) {
  try {
    await localforage.setItem(STORAGE_KEYS.TRAINING_STATS, stats);
    return stats;
  } catch (error) {
    console.error('保存训练统计数据失败:', error);
    throw error;
  }
}

/**
 * 获取训练统计数据
 * @returns {Promise<Object>} - 训练统计数据
 */
export async function getTrainingStats() {
  try {
    const stats = await localforage.getItem(STORAGE_KEYS.TRAINING_STATS);
    return stats || getDefaultStats();
  } catch (error) {
    console.error('获取训练统计数据失败:', error);
    return getDefaultStats();
  }
}

/**
 * 获取默认统计数据
 * @returns {Object} - 默认统计数据
 */
export function getDefaultStats() {
  return {
    totalSessions: 0,
    totalTime: 0, // 秒
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
  };
}

/**
 * 保存舒尔特表训练历史记录
 * @param {Array} history - 训练历史记录数组
 * @returns {Promise<Array>} - 保存的历史记录
 */
export async function saveSchulteHistory(history) {
  try {
    await localforage.setItem(STORAGE_KEYS.SCHULTE_HISTORY, history);
    return history;
  } catch (error) {
    console.error('保存舒尔特表训练历史失败:', error);
    throw error;
  }
}

/**
 * 获取舒尔特表训练历史记录
 * @returns {Promise<Array>} - 训练历史记录数组
 */
export async function getSchulteHistory() {
  try {
    const history = await localforage.getItem(STORAGE_KEYS.SCHULTE_HISTORY);
    return history || [];
  } catch (error) {
    console.error('获取舒尔特表训练历史失败:', error);
    return [];
  }
}

/**
 * 添加舒尔特表训练记录
 * @param {Object} record - 训练记录
 * @returns {Promise<Array>} - 更新后的历史记录
 */
export async function addSchulteRecord(record) {
  try {
    const history = await getSchulteHistory();
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newRecord, ...history].slice(0, 100); // 只保留最近100条记录
    await saveSchulteHistory(newHistory);
    
    // 更新总体统计数据
    await updateTrainingStats('schulte', newRecord);
    
    return newHistory;
  } catch (error) {
    console.error('添加舒尔特表训练记录失败:', error);
    throw error;
  }
}

/**
 * 保存速读训练历史记录
 * @param {Array} history - 训练历史记录数组
 * @returns {Promise<Array>} - 保存的历史记录
 */
export async function saveSpeedReadingHistory(history) {
  try {
    await localforage.setItem(STORAGE_KEYS.SPEED_READING_HISTORY, history);
    return history;
  } catch (error) {
    console.error('保存速读训练历史失败:', error);
    throw error;
  }
}

/**
 * 获取速读训练历史记录
 * @returns {Promise<Array>} - 训练历史记录数组
 */
export async function getSpeedReadingHistory() {
  try {
    const history = await localforage.getItem(STORAGE_KEYS.SPEED_READING_HISTORY);
    return history || [];
  } catch (error) {
    console.error('获取速读训练历史失败:', error);
    return [];
  }
}

/**
 * 添加速读训练记录
 * @param {Object} record - 训练记录
 * @returns {Promise<Array>} - 更新后的历史记录
 */
export async function addSpeedReadingRecord(record) {
  try {
    const history = await getSpeedReadingHistory();
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newRecord, ...history].slice(0, 100); // 只保留最近100条记录
    await saveSpeedReadingHistory(newHistory);
    
    // 更新总体统计数据
    await updateTrainingStats('speedReading', newRecord);
    
    return newHistory;
  } catch (error) {
    console.error('添加速读训练记录失败:', error);
    throw error;
  }
}

/**
 * 保存闪视训练历史记录
 * @param {Array} history - 训练历史记录数组
 * @returns {Promise<Array>} - 保存的历史记录
 */
export async function saveFlashVisionHistory(history) {
  try {
    await localforage.setItem(STORAGE_KEYS.FLASH_VISION_HISTORY, history);
    return history;
  } catch (error) {
    console.error('保存闪视训练历史失败:', error);
    throw error;
  }
}

/**
 * 获取闪视训练历史记录
 * @returns {Promise<Array>} - 训练历史记录数组
 */
export async function getFlashVisionHistory() {
  try {
    const history = await localforage.getItem(STORAGE_KEYS.FLASH_VISION_HISTORY);
    return history || [];
  } catch (error) {
    console.error('获取闪视训练历史失败:', error);
    return [];
  }
}

/**
 * 添加闪视训练记录
 * @param {Object} record - 训练记录
 * @returns {Promise<Array>} - 更新后的历史记录
 */
export async function addFlashVisionRecord(record) {
  try {
    const history = await getFlashVisionHistory();
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString()
    };
    const newHistory = [newRecord, ...history].slice(0, 100); // 只保留最近100条记录
    await saveFlashVisionHistory(newHistory);
    
    // 更新总体统计数据
    await updateTrainingStats('flashVision', newRecord);
    
    return newHistory;
  } catch (error) {
    console.error('添加闪视训练记录失败:', error);
    throw error;
  }
}

/**
 * 更新训练统计数据
 * @param {string} moduleType - 训练模块类型 ('schulte', 'speedReading', 'flashVision')
 * @param {Object} record - 训练记录
 * @returns {Promise<Object>} - 更新后的统计数据
 */
async function updateTrainingStats(moduleType, record) {
  try {
    const stats = await getTrainingStats();
    
    // 更新总体统计
    stats.totalSessions += 1;
    stats.lastSession = new Date().toISOString();
    
    // 根据训练类型更新特定模块的统计数据
    if (moduleType === 'schulte') {
      const moduleStats = stats.moduleStats.schulte;
      moduleStats.sessions += 1;
      
      // 更新最佳时间
      if (!moduleStats.bestTime || record.completionTime < moduleStats.bestTime) {
        moduleStats.bestTime = record.completionTime;
      }
      
      // 更新平均时间
      if (!moduleStats.averageTime) {
        moduleStats.averageTime = record.completionTime;
      } else {
        moduleStats.averageTime = (
          (moduleStats.averageTime * (moduleStats.sessions - 1) + record.completionTime) / 
          moduleStats.sessions
        );
      }
      
      // 更新总训练时间
      stats.totalTime += record.completionTime;
    } 
    else if (moduleType === 'speedReading') {
      const moduleStats = stats.moduleStats.speedReading;
      moduleStats.sessions += 1;
      
      // 更新最高速度
      if (!moduleStats.highestSpeed || record.effectiveReadingSpeed > moduleStats.highestSpeed) {
        moduleStats.highestSpeed = record.effectiveReadingSpeed;
      }
      
      // 更新平均速度
      if (!moduleStats.averageSpeed) {
        moduleStats.averageSpeed = record.effectiveReadingSpeed;
      } else {
        moduleStats.averageSpeed = (
          (moduleStats.averageSpeed * (moduleStats.sessions - 1) + record.effectiveReadingSpeed) / 
          moduleStats.sessions
        );
      }
      
      // 更新平均理解率
      if (!moduleStats.averageComprehension) {
        moduleStats.averageComprehension = record.correctPercentage;
      } else {
        moduleStats.averageComprehension = (
          (moduleStats.averageComprehension * (moduleStats.sessions - 1) + record.correctPercentage) / 
          moduleStats.sessions
        );
      }
      
      // 更新总训练时间
      stats.totalTime += record.readingTime;
    } 
    else if (moduleType === 'flashVision') {
      const moduleStats = stats.moduleStats.flashVision;
      moduleStats.sessions += 1;
      
      // 更新最高准确率
      if (!moduleStats.highestAccuracy || record.correctPercentage > moduleStats.highestAccuracy) {
        moduleStats.highestAccuracy = record.correctPercentage;
      }
      
      // 更新平均准确率
      if (!moduleStats.averageAccuracy) {
        moduleStats.averageAccuracy = record.correctPercentage;
      } else {
        moduleStats.averageAccuracy = (
          (moduleStats.averageAccuracy * (moduleStats.sessions - 1) + record.correctPercentage) / 
          moduleStats.sessions
        );
      }
      
      // 更新最快响应时间
      if (!moduleStats.fastestResponseTime || record.averageResponseTime < moduleStats.fastestResponseTime) {
        moduleStats.fastestResponseTime = record.averageResponseTime;
      }
      
      // 假设每个闪视训练回合平均10秒
      const estimatedTime = record.totalRounds * 10;
      stats.totalTime += estimatedTime;
    }
    
    // 保存更新后的统计数据
    await saveTrainingStats(stats);
    
    return stats;
  } catch (error) {
    console.error('更新训练统计数据失败:', error);
    throw error;
  }
}

/**
 * 导出所有训练数据
 * @param {boolean} includeMetadata - 是否包含元数据
 * @returns {Promise<Object>} - 所有训练数据
 */
export async function exportAllData(includeMetadata = true) {
  try {
    const settings = await getUserSettings();
    const stats = await getTrainingStats();
    const schulteHistory = await getSchulteHistory();
    const speedReadingHistory = await getSpeedReadingHistory();
    const flashVisionHistory = await getFlashVisionHistory();
    
    const exportData = {
      settings,
      stats,
      history: {
        schulte: schulteHistory,
        speedReading: speedReadingHistory,
        flashVision: flashVisionHistory
      }
    };
    
    if (includeMetadata) {
      exportData.metadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        appName: '全脑训练工具',
        platform: navigator.platform,
        userAgent: navigator.userAgent
      };
    }
    
    return exportData;
  } catch (error) {
    console.error('导出训练数据失败:', error);
    throw error;
  }
}

/**
 * 导入训练数据
 * @param {Object} data - 要导入的训练数据
 * @param {boolean} preserveSettings - 是否保留当前设置
 * @returns {Promise<boolean>} - 导入是否成功
 */
export async function importData(data, preserveSettings = false) {
  try {
    // 验证数据格式
    if (!data || !data.settings || !data.stats || !data.history) {
      throw new Error('导入数据格式无效');
    }
    
    // 导入设置
    if (!preserveSettings) {
      // 如果导入的数据没有数据管理设置，但当前设置有，则保留当前的数据管理设置
      if (!data.settings.dataManagement) {
        const currentSettings = await getUserSettings();
        if (currentSettings.dataManagement) {
          data.settings.dataManagement = currentSettings.dataManagement;
        } else {
          // 使用默认的数据管理设置
          data.settings.dataManagement = getDefaultSettings().dataManagement;
        }
      }
      await saveUserSettings(data.settings);
    }
    
    // 导入统计数据
    await saveTrainingStats(data.stats);
    
    // 导入历史记录
    if (data.history.schulte) {
      await saveSchulteHistory(data.history.schulte);
    }
    
    if (data.history.speedReading) {
      await saveSpeedReadingHistory(data.history.speedReading);
    }
    
    if (data.history.flashVision) {
      await saveFlashVisionHistory(data.history.flashVision);
    }
    
    // 导入成功后，如果启用了自动备份，创建一个新的备份
    const settings = await getUserSettings();
    if (settings.dataManagement && settings.dataManagement.autoBackupEnabled) {
      await createAutoBackup();
    }
    
    return true;
  } catch (error) {
    console.error('导入训练数据失败:', error);
    throw error;
  }
}

/**
 * 清除所有训练数据
 * @param {boolean} keepSettings - 是否保留设置
 * @returns {Promise<boolean>} - 清除是否成功
 */
export async function clearAllData(keepSettings = false) {
  try {
    if (keepSettings) {
      // 先保存当前设置
      const currentSettings = await getUserSettings();
      
      // 清除除设置外的所有数据
      await localforage.removeItem(STORAGE_KEYS.TRAINING_STATS);
      await localforage.removeItem(STORAGE_KEYS.SCHULTE_HISTORY);
      await localforage.removeItem(STORAGE_KEYS.SPEED_READING_HISTORY);
      await localforage.removeItem(STORAGE_KEYS.FLASH_VISION_HISTORY);
      await localforage.removeItem(STORAGE_KEYS.AUTO_BACKUP);
      await localforage.removeItem(STORAGE_KEYS.LAST_BACKUP_DATE);
      
      // 重新保存设置
      await saveUserSettings(currentSettings);
    } else {
      // 清除所有数据
      await localforage.clear();
    }
    return true;
  } catch (error) {
    console.error('清除训练数据失败:', error);
    throw error;
  }
}

/**
 * 创建自动备份
 * @returns {Promise<Object>} - 备份数据
 */
export async function createAutoBackup() {
  try {
    // 导出数据（不包含元数据）
    const backupData = await exportAllData(false);
    
    // 保存备份
    await localforage.setItem(STORAGE_KEYS.AUTO_BACKUP, backupData);
    await localforage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, new Date().toISOString());
    
    return backupData;
  } catch (error) {
    console.error('创建自动备份失败:', error);
    throw error;
  }
}

/**
 * 获取最后一次自动备份
 * @returns {Promise<Object>} - 备份数据
 */
export async function getLastAutoBackup() {
  try {
    const backupData = await localforage.getItem(STORAGE_KEYS.AUTO_BACKUP);
    const lastBackupDate = await localforage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);
    
    if (!backupData) {
      return null;
    }
    
    return {
      data: backupData,
      date: lastBackupDate
    };
  } catch (error) {
    console.error('获取自动备份失败:', error);
    return null;
  }
}

/**
 * 从自动备份恢复数据
 * @returns {Promise<boolean>} - 恢复是否成功
 */
export async function restoreFromAutoBackup() {
  try {
    const backup = await getLastAutoBackup();
    
    if (!backup || !backup.data) {
      throw new Error('没有可用的备份数据');
    }
    
    // 导入备份数据
    await importData(backup.data);
    
    return true;
  } catch (error) {
    console.error('从自动备份恢复失败:', error);
    throw error;
  }
}

/**
 * 检查是否需要创建自动备份
 * @param {number} backupInterval - 备份间隔（天）
 * @returns {Promise<boolean>} - 是否创建了新备份
 */
export async function checkAndCreateAutoBackup(backupInterval = 1) {
  try {
    const lastBackupDate = await localforage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);
    
    // 如果没有上次备份日期，或者已经过了备份间隔，则创建新备份
    if (!lastBackupDate) {
      await createAutoBackup();
      return true;
    }
    
    const lastBackup = new Date(lastBackupDate);
    const now = new Date();
    const daysSinceLastBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastBackup >= backupInterval) {
      await createAutoBackup();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查自动备份失败:', error);
    return false;
  }
}

/**
 * 保存冥想模块数据
 * @param {Object} data - 冥想模块数据
 * @returns {Promise<Object>} - 保存的数据
 */
export async function saveMeditationData(data) {
  try {
    await localforage.setItem(STORAGE_KEYS.MEDITATION_DATA, data);
    return data;
  } catch (error) {
    console.error('保存冥想数据失败:', error);
    throw error;
  }
}

/**
 * 获取冥想模块数据
 * @returns {Promise<Object>} - 冥想模块数据
 */
export async function getMeditationData() {
  try {
    const data = await localforage.getItem(STORAGE_KEYS.MEDITATION_DATA);
    return data || getDefaultMeditationData();
  } catch (error) {
    console.error('获取冥想数据失败:', error);
    return getDefaultMeditationData();
  }
}

/**
 * 获取默认冥想数据
 * @returns {Object} - 默认冥想数据
 */
export function getDefaultMeditationData() {
  return {
    guidedMeditation: {
      settings: {
        dailyGoal: 20,
        weeklyGoal: 140,
        reminderEnabled: true,
        reminderTime: '09:00',
        autoPlay: false,
        fadeInOut: true
      },
      progress: {
        totalMinutes: 0,
        totalSessions: 0,
        streakDays: 0,
        completedDays: 0
      },
      analytics: {
        favoriteCategory: '',
        averageSessionLength: 0,
        preferredDifficulty: 'beginner'
      },
      sessions: []
    },
    brainwaveGenerator: {
      settings: {
        autoStop: true,
        backgroundSound: 'none',
        backgroundVolume: 30,
        mode: 'single'
      },
      analytics: {
        totalMinutes: 0,
        totalSessions: 0,
        favoriteWave: '',
        frequencyUsage: {},
        effectRatings: {}
      },
      sessions: []
    },
    metronome: {
      settings: {
        autoStop: true,
        countIn: true,
        accentBeat: true,
        visualOnly: false,
        subdivision: 'quarter',
        goal: 'focus'
      },
      analytics: {
        totalMinutes: 0,
        totalSessions: 0,
        averageTempo: 120,
        tempoUsage: {},
        effectRatings: {}
      },
      sessions: []
    }
  };
}

// 导出存储键名常量
export { STORAGE_KEYS };