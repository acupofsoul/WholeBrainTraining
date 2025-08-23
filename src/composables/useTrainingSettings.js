import { ref, computed, onMounted, onUnmounted } from 'vue'
import settingsPersistence, { SETTING_CATEGORIES } from '@/services/settingsPersistence'
import configService from '@/services/configService'

// 默认训练设置
const defaultTrainingSettings = {
  imageFlash: {
    // 基础设置
    imageCount: 20,
    displayTime: 1000,
    intervalTime: 500,
    difficulty: 'medium',
    
    // 图片设置
    imageSize: 'medium',
    imageType: 'mixed',
    showProgress: true,
    
    // 高级设置
    randomOrder: true,
    autoStart: false,
    soundEnabled: true,
    fullScreen: false,
    
    // 反馈设置
    showFeedback: true,
    detailedStats: true,
    saveResults: true
  },
  
  articleFlash: {
    // 基础设置
    articleLength: 'medium',
    displayTime: 3000,
    difficulty: 'medium',
    
    // 内容设置
    fontSize: 'medium',
    fontFamily: 'default',
    lineHeight: 'normal',
    showProgress: true,
    
    // 高级设置
    randomOrder: true,
    autoStart: false,
    soundEnabled: true,
    fullScreen: false,
    
    // 反馈设置
    showFeedback: true,
    comprehensionTest: true,
    saveResults: true
  },
  
  expandVision: {
    // 基础设置
    gridSize: 3,
    displayTime: 2000,
    intervalTime: 1000,
    difficulty: 'medium',
    
    // 视觉设置
    dotSize: 'medium',
    dotColor: '#007bff',
    backgroundColor: '#ffffff',
    showGrid: false,
    
    // 训练设置
    sessionCount: 10,
    autoProgress: true,
    adaptiveDifficulty: false,
    
    // 反馈设置
    showFeedback: true,
    soundEnabled: true,
    saveResults: true
  },
  
  attention: {
    // 基础设置
    taskType: 'color',
    difficulty: 'medium',
    sessionDuration: 300, // 5分钟
    
    // 刺激设置
    stimulusCount: 50,
    stimulusInterval: 2000,
    targetProbability: 0.3,
    
    // 视觉设置
    stimulusSize: 'medium',
    backgroundColor: '#f8f9fa',
    showProgress: true,
    
    // 高级设置
    adaptiveDifficulty: false,
    soundEnabled: true,
    vibrationEnabled: false,
    
    // 反馈设置
    showFeedback: true,
    realtimeFeedback: false,
    saveResults: true
  }
}

// 难度级别定义
const difficultyLevels = {
  easy: { label: '简单', value: 'easy', multiplier: 0.7 },
  medium: { label: '中等', value: 'medium', multiplier: 1.0 },
  hard: { label: '困难', value: 'hard', multiplier: 1.3 },
  expert: { label: '专家', value: 'expert', multiplier: 1.6 }
}

// 训练模式定义
const trainingModes = {
  practice: { label: '练习模式', value: 'practice', description: '自由练习，不计入成绩' },
  training: { label: '训练模式', value: 'training', description: '正式训练，记录进度' },
  challenge: { label: '挑战模式', value: 'challenge', description: '高难度挑战' }
}

/**
 * 训练设置管理 Composable
 * @param {string} trainingType - 训练类型 (imageFlash, articleFlash, expandVision, attention)
 * @returns {Object} 训练设置相关的响应式数据和方法
 */
export function useTrainingSettings(trainingType) {
  if (!trainingType || !defaultTrainingSettings[trainingType]) {
    throw new Error(`无效的训练类型: ${trainingType}`)
  }

  // 响应式状态
  const settings = ref({ ...defaultTrainingSettings[trainingType] })
  const isLoading = ref(true)
  const error = ref(null)
  let unsubscribe = null

  // 初始化设置
  const initSettings = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // 从持久化存储加载设置
      const savedSettings = await settingsPersistence.getSettings(
        SETTING_CATEGORIES.TRAINING,
        trainingType,
        defaultTrainingSettings[trainingType]
      )
      
      settings.value = { ...defaultTrainingSettings[trainingType], ...savedSettings }
      
      // 监听设置变化
      unsubscribe = settingsPersistence.addListener(
        SETTING_CATEGORIES.TRAINING,
        handleSettingsChange
      )
      
    } catch (err) {
      console.error('初始化训练设置失败:', err)
      error.value = err.message
      // 使用默认设置作为后备
      settings.value = { ...defaultTrainingSettings[trainingType] }
    } finally {
      isLoading.value = false
    }
  }

  // 处理设置变化
  const handleSettingsChange = ({ category, key, value }) => {
    if (category === SETTING_CATEGORIES.TRAINING && key === trainingType) {
      settings.value = { ...settings.value, ...value }
    }
  }

  // 更新设置
  const updateSettings = async (newSettings, options = {}) => {
    try {
      const updatedSettings = { ...settings.value, ...newSettings }
      
      // 立即更新本地状态
      settings.value = updatedSettings
      
      // 保存到持久化存储
      await settingsPersistence.saveSettings(
        SETTING_CATEGORIES.TRAINING,
        trainingType,
        updatedSettings,
        {
          immediate: options.immediate || false,
          backup: options.backup !== false,
          notify: options.notify !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig(`training.${trainingType}`, updatedSettings)
      
    } catch (err) {
      console.error('更新训练设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 重置设置
  const resetSettings = async (options = {}) => {
    try {
      const defaultSettingsData = { ...defaultTrainingSettings[trainingType] }
      
      // 立即更新本地状态
      settings.value = defaultSettingsData
      
      // 重置持久化存储
      await settingsPersistence.resetSettings(
        SETTING_CATEGORIES.TRAINING,
        trainingType
      )
      
      // 保存默认设置
      await settingsPersistence.saveSettings(
        SETTING_CATEGORIES.TRAINING,
        trainingType,
        defaultSettingsData,
        {
          immediate: true,
          backup: options.backup !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig(`training.${trainingType}`, defaultSettingsData)
      
    } catch (err) {
      console.error('重置训练设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 导出设置
  const exportSettings = async () => {
    try {
      return await settingsPersistence.exportAllSettings()
    } catch (err) {
      console.error('导出训练设置失败:', err)
      throw err
    }
  }

  // 导入设置
  const importSettings = async (importData, options = {}) => {
    try {
      await settingsPersistence.importSettings(importData, options)
      // 重新初始化设置
      await initSettings()
    } catch (err) {
      console.error('导入训练设置失败:', err)
      throw err
    }
  }

  // 计算属性
  const currentDifficulty = computed(() => {
    return difficultyLevels[settings.value.difficulty] || difficultyLevels.medium
  })

  const estimatedDuration = computed(() => {
    const baseTime = getBaseDuration(trainingType, settings.value)
    const difficultyMultiplier = currentDifficulty.value.multiplier
    return Math.round(baseTime * difficultyMultiplier)
  })

  // 设置分组
  const settingsSections = computed(() => {
    return getSettingsSections(trainingType, settings.value)
  })

  // 生命周期管理
  onMounted(() => {
    initSettings()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    settings,
    isLoading,
    error,
    difficultyLevels,
    trainingModes,
    currentDifficulty,
    estimatedDuration,
    settingsSections,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings
  }
}

// 辅助函数：获取基础训练时长
function getBaseDuration(trainingType, settings) {
  switch (trainingType) {
    case 'imageFlash':
      return (settings.displayTime + settings.intervalTime) * settings.imageCount / 1000
    case 'articleFlash':
      return settings.displayTime * 3 / 1000 // 假设3篇文章
    case 'expandVision':
      return (settings.displayTime + settings.intervalTime) * settings.sessionCount / 1000
    case 'attention':
      return settings.sessionDuration
    default:
      return 300 // 默认5分钟
  }
}

// 辅助函数：获取设置分组
function getSettingsSections(trainingType, settings) {
  const commonSections = {
    basic: {
      title: '基础设置',
      icon: 'settings',
      settings: []
    },
    advanced: {
      title: '高级设置',
      icon: 'tune',
      settings: []
    },
    feedback: {
      title: '反馈设置',
      icon: 'feedback',
      settings: []
    }
  }

  switch (trainingType) {
    case 'imageFlash':
      return {
        ...commonSections,
        basic: {
          ...commonSections.basic,
          settings: ['imageCount', 'displayTime', 'intervalTime', 'difficulty']
        },
        visual: {
          title: '视觉设置',
          icon: 'visibility',
          settings: ['imageSize', 'imageType', 'showProgress']
        },
        advanced: {
          ...commonSections.advanced,
          settings: ['randomOrder', 'autoStart', 'soundEnabled', 'fullScreen']
        },
        feedback: {
          ...commonSections.feedback,
          settings: ['showFeedback', 'detailedStats', 'saveResults']
        }
      }

    case 'articleFlash':
      return {
        ...commonSections,
        basic: {
          ...commonSections.basic,
          settings: ['articleLength', 'displayTime', 'difficulty']
        },
        content: {
          title: '内容设置',
          icon: 'text_fields',
          settings: ['fontSize', 'fontFamily', 'lineHeight', 'showProgress']
        },
        advanced: {
          ...commonSections.advanced,
          settings: ['randomOrder', 'autoStart', 'soundEnabled', 'fullScreen']
        },
        feedback: {
          ...commonSections.feedback,
          settings: ['showFeedback', 'comprehensionTest', 'saveResults']
        }
      }

    case 'expandVision':
      return {
        ...commonSections,
        basic: {
          ...commonSections.basic,
          settings: ['gridSize', 'displayTime', 'intervalTime', 'difficulty']
        },
        visual: {
          title: '视觉设置',
          icon: 'visibility',
          settings: ['dotSize', 'dotColor', 'backgroundColor', 'showGrid']
        },
        training: {
          title: '训练设置',
          icon: 'fitness_center',
          settings: ['sessionCount', 'autoProgress', 'adaptiveDifficulty']
        },
        feedback: {
          ...commonSections.feedback,
          settings: ['showFeedback', 'soundEnabled', 'saveResults']
        }
      }

    case 'attention':
      return {
        ...commonSections,
        basic: {
          ...commonSections.basic,
          settings: ['taskType', 'difficulty', 'sessionDuration']
        },
        stimulus: {
          title: '刺激设置',
          icon: 'flash_on',
          settings: ['stimulusCount', 'stimulusInterval', 'targetProbability']
        },
        visual: {
          title: '视觉设置',
          icon: 'visibility',
          settings: ['stimulusSize', 'backgroundColor', 'showProgress']
        },
        advanced: {
          ...commonSections.advanced,
          settings: ['adaptiveDifficulty', 'soundEnabled', 'vibrationEnabled']
        },
        feedback: {
          ...commonSections.feedback,
          settings: ['showFeedback', 'realtimeFeedback', 'saveResults']
        }
      }

    default:
      return commonSections
  }
}

export { defaultTrainingSettings, difficultyLevels, trainingModes }