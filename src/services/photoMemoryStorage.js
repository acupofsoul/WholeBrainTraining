/**
 * 照相记忆训练数据存储服务
 * 统一管理照相记忆各个子模块的训练数据和统计信息
 */

class PhotoMemoryStorage {
  constructor() {
    this.storageKeys = {
      afterimage: 'photo-memory-afterimage',
      colorPerception: 'photo-memory-color-perception',
      threeDCard: 'photo-memory-3d-card',
      thousandImages: 'photo-memory-thousand-images',
      memoryTraining: 'photo-memory-memory-training',
      instantCalculation: 'photo-memory-instant-calculation',
      overall: 'photo-memory-overall'
    };
  }

  // 获取默认的训练统计数据结构
  getDefaultStats(module) {
    const baseStats = {
      totalSessions: 0,
      totalTime: 0,
      averageAccuracy: 0,
      bestScore: 0,
      lastTrainingDate: null,
      currentStreak: 0,
      longestStreak: 0
    };

    const moduleSpecificStats = {
      afterimage: {
        ...baseStats,
        averageGazeTime: 0,
        totalGazeTime: 0,
        preferredImageType: 'circle',
        preferredColor: 'red'
      },
      colorPerception: {
        ...baseStats,
        averageReactionTime: 0,
        difficultyProgress: {
          easy: { completed: 0, accuracy: 0 },
          medium: { completed: 0, accuracy: 0 },
          hard: { completed: 0, accuracy: 0 }
        },
        colorAccuracy: {}
      },
      threeDCard: {
        ...baseStats,
        maxLevel: 1,
        cardsMemorized: 0,
        averageMemoryTime: 0,
        sequenceAccuracy: 0
      },
      thousandImages: {
        ...baseStats,
        imagesRecognized: 0,
        categoriesCompleted: [],
        averageRecognitionTime: 0,
        difficultyLevels: {
          beginner: { completed: 0, accuracy: 0 },
          intermediate: { completed: 0, accuracy: 0 },
          advanced: { completed: 0, accuracy: 0 }
        }
      },
      memoryTraining: {
        ...baseStats,
        modeStats: {
          numbers: { sessions: 0, accuracy: 0, bestScore: 0 },
          images: { sessions: 0, accuracy: 0, bestScore: 0 },
          words: { sessions: 0, accuracy: 0, bestScore: 0 },
          colors: { sessions: 0, accuracy: 0, bestScore: 0 },
          shapes: { sessions: 0, accuracy: 0, bestScore: 0 },
          faces: { sessions: 0, accuracy: 0, bestScore: 0 }
        },
        memoryCapacity: {
          numbers: 5,
          images: 6,
          words: 4,
          colors: 5,
          shapes: 5,
          faces: 3
        },
        preferredSettings: {
          mode: 'numbers',
          difficulty: 'medium',
          memoryTime: 3,
          itemCount: 6
        }
      },
      instantCalculation: {
        ...baseStats,
        calculationTypes: {
          addition: { completed: 0, accuracy: 0, avgTime: 0 },
          subtraction: { completed: 0, accuracy: 0, avgTime: 0 },
          multiplication: { completed: 0, accuracy: 0, avgTime: 0 },
          division: { completed: 0, accuracy: 0, avgTime: 0 }
        },
        speedLevels: {
          slow: { completed: 0, accuracy: 0 },
          normal: { completed: 0, accuracy: 0 },
          fast: { completed: 0, accuracy: 0 },
          lightning: { completed: 0, accuracy: 0 }
        },
        maxDigits: 2
      }
    };

    return moduleSpecificStats[module] || baseStats;
  }

  // 获取训练统计数据
  getStats(module) {
    try {
      const key = this.storageKeys[module];
      if (!key) {
        console.warn(`Unknown module: ${module}`);
        return this.getDefaultStats(module);
      }

      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认数据，确保新字段的兼容性
        return { ...this.getDefaultStats(module), ...parsed };
      }
      return this.getDefaultStats(module);
    } catch (error) {
      console.error(`Error loading stats for ${module}:`, error);
      return this.getDefaultStats(module);
    }
  }

  // 保存训练统计数据
  saveStats(module, stats) {
    try {
      const key = this.storageKeys[module];
      if (!key) {
        console.warn(`Unknown module: ${module}`);
        return false;
      }

      // 更新最后训练日期
      stats.lastTrainingDate = new Date().toISOString();
      
      localStorage.setItem(key, JSON.stringify(stats));
      
      // 更新总体统计
      this.updateOverallStats();
      
      return true;
    } catch (error) {
      console.error(`Error saving stats for ${module}:`, error);
      return false;
    }
  }

  // 更新训练统计
  updateStats(module, sessionData) {
    const stats = this.getStats(module);
    
    // 基础统计更新
    stats.totalSessions++;
    stats.totalTime += sessionData.duration || 0;
    
    if (sessionData.score !== undefined && sessionData.maxScore !== undefined) {
      const accuracy = (sessionData.score / sessionData.maxScore) * 100;
      stats.averageAccuracy = ((stats.averageAccuracy * (stats.totalSessions - 1)) + accuracy) / stats.totalSessions;
      
      if (sessionData.score > stats.bestScore) {
        stats.bestScore = sessionData.score;
      }
    }

    // 连续训练天数更新
    const today = new Date().toDateString();
    const lastDate = stats.lastTrainingDate ? new Date(stats.lastTrainingDate).toDateString() : null;
    
    if (lastDate === today) {
      // 今天已经训练过，不更新连续天数
    } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
      // 昨天训练过，连续天数+1
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else {
      // 中断了连续训练
      stats.currentStreak = 1;
    }

    // 模块特定的统计更新
    this.updateModuleSpecificStats(module, stats, sessionData);
    
    this.saveStats(module, stats);
    return stats;
  }

  // 更新模块特定统计
  updateModuleSpecificStats(module, stats, sessionData) {
    switch (module) {
      case 'afterimage':
        if (sessionData.gazeTime) {
          stats.totalGazeTime += sessionData.gazeTime;
          stats.averageGazeTime = stats.totalGazeTime / stats.totalSessions;
        }
        if (sessionData.imageType) stats.preferredImageType = sessionData.imageType;
        if (sessionData.color) stats.preferredColor = sessionData.color;
        break;

      case 'colorPerception':
        if (sessionData.reactionTime) {
          stats.averageReactionTime = ((stats.averageReactionTime * (stats.totalSessions - 1)) + sessionData.reactionTime) / stats.totalSessions;
        }
        if (sessionData.difficulty && sessionData.accuracy !== undefined) {
          const diffStats = stats.difficultyProgress[sessionData.difficulty];
          if (diffStats) {
            diffStats.completed++;
            diffStats.accuracy = ((diffStats.accuracy * (diffStats.completed - 1)) + sessionData.accuracy) / diffStats.completed;
          }
        }
        break;

      case 'memoryTraining':
        if (sessionData.mode && sessionData.accuracy !== undefined) {
          const modeStats = stats.modeStats[sessionData.mode];
          if (modeStats) {
            modeStats.sessions++;
            modeStats.accuracy = ((modeStats.accuracy * (modeStats.sessions - 1)) + sessionData.accuracy) / modeStats.sessions;
            if (sessionData.score > modeStats.bestScore) {
              modeStats.bestScore = sessionData.score;
            }
          }
        }
        if (sessionData.settings) {
          stats.preferredSettings = { ...stats.preferredSettings, ...sessionData.settings };
        }
        break;

      case 'instantCalculation':
        if (sessionData.calculationType && sessionData.accuracy !== undefined) {
          const typeStats = stats.calculationTypes[sessionData.calculationType];
          if (typeStats) {
            typeStats.completed++;
            typeStats.accuracy = ((typeStats.accuracy * (typeStats.completed - 1)) + sessionData.accuracy) / typeStats.completed;
            if (sessionData.avgTime) {
              typeStats.avgTime = ((typeStats.avgTime * (typeStats.completed - 1)) + sessionData.avgTime) / typeStats.completed;
            }
          }
        }
        break;
    }
  }

  // 获取总体统计
  getOverallStats() {
    try {
      const stored = localStorage.getItem(this.storageKeys.overall);
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        totalSessions: 0,
        totalTime: 0,
        averageAccuracy: 0,
        modulesCompleted: [],
        favoriteModule: null,
        weeklyProgress: [],
        monthlyProgress: [],
        achievements: []
      };
    } catch (error) {
      console.error('Error loading overall stats:', error);
      return {};
    }
  }

  // 更新总体统计
  updateOverallStats() {
    try {
      const modules = ['afterimage', 'colorPerception', 'threeDCard', 'thousandImages', 'memoryTraining', 'instantCalculation'];
      const overallStats = this.getOverallStats();
      
      let totalSessions = 0;
      let totalTime = 0;
      let totalAccuracy = 0;
      let moduleCount = 0;
      let moduleSessionCounts = {};

      modules.forEach(module => {
        const stats = this.getStats(module);
        if (stats.totalSessions > 0) {
          totalSessions += stats.totalSessions;
          totalTime += stats.totalTime;
          totalAccuracy += stats.averageAccuracy;
          moduleCount++;
          moduleSessionCounts[module] = stats.totalSessions;
        }
      });

      overallStats.totalSessions = totalSessions;
      overallStats.totalTime = totalTime;
      overallStats.averageAccuracy = moduleCount > 0 ? totalAccuracy / moduleCount : 0;
      
      // 找出最常用的模块
      if (Object.keys(moduleSessionCounts).length > 0) {
        overallStats.favoriteModule = Object.keys(moduleSessionCounts).reduce((a, b) => 
          moduleSessionCounts[a] > moduleSessionCounts[b] ? a : b
        );
      }

      localStorage.setItem(this.storageKeys.overall, JSON.stringify(overallStats));
    } catch (error) {
      console.error('Error updating overall stats:', error);
    }
  }

  // 获取进度分析数据
  getProgressAnalysis(module, days = 30) {
    const stats = this.getStats(module);
    const analysis = {
      improvement: 0,
      consistency: 0,
      recommendations: [],
      strengths: [],
      weaknesses: []
    };

    // 基于统计数据生成分析
    if (stats.totalSessions > 0) {
      // 计算改进程度
      if (stats.currentStreak > 0) {
        analysis.improvement = Math.min(stats.currentStreak * 10, 100);
      }
      
      // 计算一致性
      analysis.consistency = Math.min((stats.currentStreak / stats.longestStreak) * 100, 100) || 0;
      
      // 生成建议
      if (stats.averageAccuracy < 60) {
        analysis.recommendations.push('建议降低难度，专注于基础训练');
      } else if (stats.averageAccuracy > 85) {
        analysis.recommendations.push('可以尝试更高难度的训练');
      }
      
      if (stats.currentStreak < 3) {
        analysis.recommendations.push('建议保持每日训练，提高训练一致性');
      }
      
      // 识别优势和劣势
      if (stats.averageAccuracy > 75) {
        analysis.strengths.push('准确率表现优秀');
      }
      
      if (stats.currentStreak > 7) {
        analysis.strengths.push('训练坚持性很好');
      }
      
      if (stats.averageAccuracy < 50) {
        analysis.weaknesses.push('准确率需要提高');
      }
    }

    return analysis;
  }

  // 导出所有数据
  exportAllData() {
    const data = {};
    Object.keys(this.storageKeys).forEach(module => {
      data[module] = this.getStats(module);
    });
    return data;
  }

  // 导入数据
  importData(data) {
    try {
      Object.keys(data).forEach(module => {
        if (this.storageKeys[module]) {
          this.saveStats(module, data[module]);
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // 清除所有数据
  clearAllData() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // 清除特定模块数据
  clearModuleData(module) {
    try {
      const key = this.storageKeys[module];
      if (key) {
        localStorage.removeItem(key);
        this.updateOverallStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error clearing data for ${module}:`, error);
      return false;
    }
  }
}

// 创建单例实例
const photoMemoryStorage = new PhotoMemoryStorage();

export default photoMemoryStorage;