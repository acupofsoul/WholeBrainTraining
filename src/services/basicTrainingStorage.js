/**
 * 基础训练模块统一数据存储服务
 * 为所有基础训练模块提供统一的数据持久化和用户偏好设置
 */

import { 
  getUserSettings, 
  saveUserSettings,
  getTrainingStats,
  saveTrainingStats
} from './storage';

// 基础训练模块存储键名
const BASIC_TRAINING_KEYS = {
  OVERALL_PERCEPTION: 'basic_overall_perception',
  EXPAND_VISION: 'basic_expand_vision', 
  READING_RHYTHM: 'basic_reading_rhythm',
  FLUENCY: 'basic_fluency',
  ATTENTION: 'basic_attention',
  SCHULTE_TABLE: 'basic_schulte_table'
};

// 默认设置结构
const getDefaultModuleSettings = (moduleType) => {
  const commonSettings = {
    soundEffects: true,
    vibration: false,
    showProgress: true,
    autoNext: false,
    theme: 'default'
  };

  const moduleSpecificSettings = {
    overall_perception: {
      ...commonSettings,
      defaultDifficulty: 'medium',
      trainingDuration: 300,
      stimulusCount: 20,
      responseTime: 3000
    },
    expand_vision: {
      ...commonSettings,
      defaultLevel: 1,
      displayTime: 1000,
      gridSize: 3,
      contentType: 'numbers'
    },
    reading_rhythm: {
      ...commonSettings,
      defaultBPM: 120,
      rhythmType: 'simple',
      visualMetronome: true,
      audioMetronome: true
    },
    fluency: {
      ...commonSettings,
      defaultSpeed: 'medium',
      textComplexity: 'medium',
      evaluationMode: 'comprehensive'
    },
    attention: {
      ...commonSettings,
      defaultMode: 'focus',
      sessionDuration: 300,
      difficultyLevel: 'medium'
    },
    schulte_table: {
      ...commonSettings,
      gridSize: 5,
      contentType: 'numbers',
      colorMode: 'monochrome',
      highlightNext: false
    }
  };

  return moduleSpecificSettings[moduleType] || commonSettings;
};

// 默认统计数据结构
const getDefaultModuleStats = () => ({
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
});

/**
 * 获取模块设置
 * @param {string} moduleType - 模块类型
 * @returns {Promise<Object>} 模块设置
 */
export async function getModuleSettings(moduleType) {
  try {
    const userSettings = await getUserSettings();
    const moduleKey = `basicTraining_${moduleType}`;
    
    if (userSettings[moduleKey]) {
      return { ...getDefaultModuleSettings(moduleType), ...userSettings[moduleKey] };
    }
    
    return getDefaultModuleSettings(moduleType);
  } catch (error) {
    console.error(`获取${moduleType}模块设置失败:`, error);
    return getDefaultModuleSettings(moduleType);
  }
}

/**
 * 保存模块设置
 * @param {string} moduleType - 模块类型
 * @param {Object} settings - 设置数据
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveModuleSettings(moduleType, settings) {
  try {
    const userSettings = await getUserSettings();
    const moduleKey = `basicTraining_${moduleType}`;
    
    userSettings[moduleKey] = {
      ...getDefaultModuleSettings(moduleType),
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    await saveUserSettings(userSettings);
    return true;
  } catch (error) {
    console.error(`保存${moduleType}模块设置失败:`, error);
    return false;
  }
}

/**
 * 获取模块统计数据
 * @param {string} moduleType - 模块类型
 * @returns {Promise<Object>} 统计数据
 */
export async function getModuleStats(moduleType) {
  try {
    const trainingStats = await getTrainingStats();
    const moduleKey = `basicTraining_${moduleType}`;
    
    if (trainingStats.moduleStats && trainingStats.moduleStats[moduleKey]) {
      return { ...getDefaultModuleStats(), ...trainingStats.moduleStats[moduleKey] };
    }
    
    return getDefaultModuleStats();
  } catch (error) {
    console.error(`获取${moduleType}模块统计数据失败:`, error);
    return getDefaultModuleStats();
  }
}

/**
 * 保存模块统计数据
 * @param {string} moduleType - 模块类型
 * @param {Object} stats - 统计数据
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveModuleStats(moduleType, stats) {
  try {
    const trainingStats = await getTrainingStats();
    const moduleKey = `basicTraining_${moduleType}`;
    
    if (!trainingStats.moduleStats) {
      trainingStats.moduleStats = {};
    }
    
    trainingStats.moduleStats[moduleKey] = {
      ...getDefaultModuleStats(),
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    
    await saveTrainingStats(trainingStats);
    return true;
  } catch (error) {
    console.error(`保存${moduleType}模块统计数据失败:`, error);
    return false;
  }
}

/**
 * 更新模块训练记录
 * @param {string} moduleType - 模块类型
 * @param {Object} record - 训练记录
 * @returns {Promise<Object>} 更新后的统计数据
 */
export async function updateModuleTrainingRecord(moduleType, record) {
  try {
    const currentStats = await getModuleStats(moduleType);
    
    // 更新基本统计
    currentStats.totalSessions += 1;
    currentStats.totalTime += record.duration || 0;
    currentStats.lastSession = new Date().toISOString();
    
    // 更新最佳成绩
    if (record.score !== undefined) {
      if (!currentStats.bestScore || record.score > currentStats.bestScore) {
        currentStats.bestScore = record.score;
      }
      
      // 更新平均成绩
      if (!currentStats.averageScore) {
        currentStats.averageScore = record.score;
      } else {
        currentStats.averageScore = (
          (currentStats.averageScore * (currentStats.totalSessions - 1) + record.score) / 
          currentStats.totalSessions
        );
      }
    }
    
    // 更新完成率
    if (record.completed !== undefined) {
      const completedSessions = currentStats.totalSessions * currentStats.completionRate / 100;
      const newCompletedSessions = completedSessions + (record.completed ? 1 : 0);
      currentStats.completionRate = (newCompletedSessions / currentStats.totalSessions) * 100;
    }
    
    // 更新进步趋势（保留最近20次记录）
    currentStats.improvementTrend.push({
      date: new Date().toISOString(),
      score: record.score,
      duration: record.duration,
      completed: record.completed
    });
    
    if (currentStats.improvementTrend.length > 20) {
      currentStats.improvementTrend = currentStats.improvementTrend.slice(-20);
    }
    
    // 更新周进度
    updateWeeklyProgress(currentStats, record);
    
    // 更新月进度
    updateMonthlyProgress(currentStats, record);
    
    // 检查成就
    checkAchievements(currentStats, record);
    
    // 保存更新后的统计数据
    await saveModuleStats(moduleType, currentStats);
    
    return currentStats;
  } catch (error) {
    console.error(`更新${moduleType}模块训练记录失败:`, error);
    throw error;
  }
}

/**
 * 更新周进度
 * @param {Object} stats - 统计数据
 * @param {Object} record - 训练记录
 */
function updateWeeklyProgress(stats, record) {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekKey = weekStart.toISOString().split('T')[0];
  
  let weekData = stats.weeklyProgress.find(w => w.week === weekKey);
  if (!weekData) {
    weekData = {
      week: weekKey,
      sessions: 0,
      totalTime: 0,
      averageScore: 0,
      completedSessions: 0
    };
    stats.weeklyProgress.push(weekData);
  }
  
  weekData.sessions += 1;
  weekData.totalTime += record.duration || 0;
  if (record.completed) weekData.completedSessions += 1;
  
  if (record.score !== undefined) {
    weekData.averageScore = (
      (weekData.averageScore * (weekData.sessions - 1) + record.score) / 
      weekData.sessions
    );
  }
  
  // 只保留最近12周的数据
  if (stats.weeklyProgress.length > 12) {
    stats.weeklyProgress = stats.weeklyProgress.slice(-12);
  }
}

/**
 * 更新月进度
 * @param {Object} stats - 统计数据
 * @param {Object} record - 训练记录
 */
function updateMonthlyProgress(stats, record) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let monthData = stats.monthlyProgress.find(m => m.month === monthKey);
  if (!monthData) {
    monthData = {
      month: monthKey,
      sessions: 0,
      totalTime: 0,
      averageScore: 0,
      completedSessions: 0
    };
    stats.monthlyProgress.push(monthData);
  }
  
  monthData.sessions += 1;
  monthData.totalTime += record.duration || 0;
  if (record.completed) monthData.completedSessions += 1;
  
  if (record.score !== undefined) {
    monthData.averageScore = (
      (monthData.averageScore * (monthData.sessions - 1) + record.score) / 
      monthData.sessions
    );
  }
  
  // 只保留最近12个月的数据
  if (stats.monthlyProgress.length > 12) {
    stats.monthlyProgress = stats.monthlyProgress.slice(-12);
  }
}

/**
 * 检查成就
 * @param {Object} stats - 统计数据
 * @param {Object} record - 训练记录
 */
function checkAchievements(stats, record) {
  const achievements = [
    {
      id: 'first_session',
      name: '初次体验',
      description: '完成第一次训练',
      condition: () => stats.totalSessions === 1
    },
    {
      id: 'ten_sessions',
      name: '坚持不懈',
      description: '完成10次训练',
      condition: () => stats.totalSessions === 10
    },
    {
      id: 'hundred_sessions',
      name: '百炼成钢',
      description: '完成100次训练',
      condition: () => stats.totalSessions === 100
    },
    {
      id: 'perfect_score',
      name: '完美表现',
      description: '获得满分成绩',
      condition: () => record.score === 100
    },
    {
      id: 'one_hour_total',
      name: '时间投入',
      description: '累计训练1小时',
      condition: () => stats.totalTime >= 3600
    },
    {
      id: 'ten_hours_total',
      name: '专注训练',
      description: '累计训练10小时',
      condition: () => stats.totalTime >= 36000
    }
  ];
  
  achievements.forEach(achievement => {
    if (achievement.condition() && !stats.achievements.find(a => a.id === achievement.id)) {
      stats.achievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        unlockedAt: new Date().toISOString()
      });
    }
  });
}

/**
 * 获取所有基础训练模块的汇总数据
 * @returns {Promise<Object>} 汇总数据
 */
export async function getAllBasicTrainingData() {
  try {
    const moduleTypes = ['overall_perception', 'expand_vision', 'reading_rhythm', 'fluency', 'attention', 'schulte_table'];
    const allData = {};
    
    for (const moduleType of moduleTypes) {
      allData[moduleType] = {
        settings: await getModuleSettings(moduleType),
        stats: await getModuleStats(moduleType)
      };
    }
    
    return allData;
  } catch (error) {
    console.error('获取基础训练汇总数据失败:', error);
    return {};
  }
}

/**
 * 导出基础训练数据
 * @returns {Promise<Object>} 导出的数据
 */
export async function exportBasicTrainingData() {
  try {
    const allData = await getAllBasicTrainingData();
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: allData
    };
  } catch (error) {
    console.error('导出基础训练数据失败:', error);
    throw error;
  }
}

/**
 * 导入基础训练数据
 * @param {Object} importData - 要导入的数据
 * @param {boolean} mergeMode - 是否合并模式（true: 合并，false: 覆盖）
 * @returns {Promise<boolean>} 导入是否成功
 */
export async function importBasicTrainingData(importData, mergeMode = true) {
  try {
    if (!importData.data) {
      throw new Error('导入数据格式无效');
    }
    
    const moduleTypes = Object.keys(importData.data);
    
    for (const moduleType of moduleTypes) {
      const moduleData = importData.data[moduleType];
      
      if (moduleData.settings) {
        if (mergeMode) {
          const currentSettings = await getModuleSettings(moduleType);
          const mergedSettings = { ...currentSettings, ...moduleData.settings };
          await saveModuleSettings(moduleType, mergedSettings);
        } else {
          await saveModuleSettings(moduleType, moduleData.settings);
        }
      }
      
      if (moduleData.stats) {
        if (mergeMode) {
          const currentStats = await getModuleStats(moduleType);
          const mergedStats = mergeStats(currentStats, moduleData.stats);
          await saveModuleStats(moduleType, mergedStats);
        } else {
          await saveModuleStats(moduleType, moduleData.stats);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('导入基础训练数据失败:', error);
    return false;
  }
}

/**
 * 合并统计数据
 * @param {Object} current - 当前统计数据
 * @param {Object} imported - 导入的统计数据
 * @returns {Object} 合并后的统计数据
 */
function mergeStats(current, imported) {
  return {
    totalSessions: current.totalSessions + imported.totalSessions,
    totalTime: current.totalTime + imported.totalTime,
    bestScore: Math.max(current.bestScore || 0, imported.bestScore || 0),
    averageScore: (
      ((current.averageScore || 0) * current.totalSessions + 
       (imported.averageScore || 0) * imported.totalSessions) / 
      (current.totalSessions + imported.totalSessions)
    ),
    lastSession: new Date(Math.max(
      new Date(current.lastSession || 0).getTime(),
      new Date(imported.lastSession || 0).getTime()
    )).toISOString(),
    completionRate: (
      (current.completionRate * current.totalSessions + 
       imported.completionRate * imported.totalSessions) / 
      (current.totalSessions + imported.totalSessions)
    ),
    improvementTrend: [...current.improvementTrend, ...imported.improvementTrend].slice(-20),
    achievements: mergeAchievements(current.achievements, imported.achievements),
    weeklyProgress: mergeProgressData(current.weeklyProgress, imported.weeklyProgress, 'week'),
    monthlyProgress: mergeProgressData(current.monthlyProgress, imported.monthlyProgress, 'month')
  };
}

/**
 * 合并成就数据
 * @param {Array} current - 当前成就
 * @param {Array} imported - 导入的成就
 * @returns {Array} 合并后的成就
 */
function mergeAchievements(current, imported) {
  const merged = [...current];
  
  imported.forEach(importedAchievement => {
    if (!merged.find(a => a.id === importedAchievement.id)) {
      merged.push(importedAchievement);
    }
  });
  
  return merged;
}

/**
 * 合并进度数据
 * @param {Array} current - 当前进度数据
 * @param {Array} imported - 导入的进度数据
 * @param {string} keyField - 键字段名
 * @returns {Array} 合并后的进度数据
 */
function mergeProgressData(current, imported, keyField) {
  const merged = [...current];
  
  imported.forEach(importedItem => {
    const existingItem = merged.find(item => item[keyField] === importedItem[keyField]);
    if (existingItem) {
      // 合并同期数据
      existingItem.sessions += importedItem.sessions;
      existingItem.totalTime += importedItem.totalTime;
      existingItem.completedSessions += importedItem.completedSessions;
      existingItem.averageScore = (
        (existingItem.averageScore * existingItem.sessions + 
         importedItem.averageScore * importedItem.sessions) / 
        (existingItem.sessions + importedItem.sessions)
      );
    } else {
      merged.push(importedItem);
    }
  });
  
  return merged.slice(-12); // 只保留最近12个周期
}

/**
 * 清除模块数据
 * @param {string} moduleType - 模块类型
 * @param {boolean} keepSettings - 是否保留设置
 * @returns {Promise<boolean>} 清除是否成功
 */
export async function clearModuleData(moduleType, keepSettings = false) {
  try {
    if (!keepSettings) {
      await saveModuleSettings(moduleType, getDefaultModuleSettings(moduleType));
    }
    
    await saveModuleStats(moduleType, getDefaultModuleStats());
    
    return true;
  } catch (error) {
    console.error(`清除${moduleType}模块数据失败:`, error);
    return false;
  }
}

/**
 * 清除所有基础训练数据
 * @param {boolean} keepSettings - 是否保留设置
 * @returns {Promise<boolean>} 清除是否成功
 */
export async function clearAllBasicTrainingData(keepSettings = false) {
  try {
    const moduleTypes = ['overall_perception', 'expand_vision', 'reading_rhythm', 'fluency', 'attention', 'schulte_table'];
    
    for (const moduleType of moduleTypes) {
      await clearModuleData(moduleType, keepSettings);
    }
    
    return true;
  } catch (error) {
    console.error('清除所有基础训练数据失败:', error);
    return false;
  }
}