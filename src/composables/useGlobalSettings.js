import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import settingsPersistence, { SETTING_CATEGORIES } from '@/services/settingsPersistence'
import configService from '@/services/configService'

// 默认全局设置
const defaultGlobalSettings = {
  // 外观设置
  theme: 'light', // light, dark, auto
  language: 'zh-CN', // zh-CN, en-US
  fontSize: 'medium', // small, medium, large
  colorScheme: 'blue', // blue, green, purple, orange
  
  // 用户体验设置
  animations: true,
  soundEnabled: true,
  vibrationEnabled: false,
  autoSave: true,
  
  // 通知设置
  notifications: {
    enabled: true,
    training: true,
    progress: true,
    achievements: true,
    reminders: true
  },
  
  // 隐私设置
  dataCollection: {
    analytics: true,
    crashReports: true,
    performance: true,
    usage: false
  },
  
  // 训练设置
  training: {
    defaultDifficulty: 'medium',
    autoProgress: true,
    adaptiveDifficulty: false,
    sessionReminders: true,
    dailyGoal: 30 // 分钟
  },
  
  // 测试设置
  testing: {
    showProgress: true,
    detailedFeedback: true,
    timeWarnings: true,
    autoSubmit: false
  },
  
  // 数据设置
  data: {
    backupEnabled: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    syncEnabled: false,
    exportFormat: 'json' // json, csv, pdf
  },
  
  // 可访问性设置
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true
  }
}

// 主题选项
const themeOptions = [
  { label: '浅色主题', value: 'light', icon: 'light_mode' },
  { label: '深色主题', value: 'dark', icon: 'dark_mode' },
  { label: '跟随系统', value: 'auto', icon: 'brightness_auto' }
]

// 语言选项
const languageOptions = [
  { label: '简体中文', value: 'zh-CN', flag: '🇨🇳' },
  { label: 'English', value: 'en-US', flag: '🇺🇸' }
]

// 字体大小选项
const fontSizeOptions = [
  { label: '小', value: 'small', size: '14px' },
  { label: '中', value: 'medium', size: '16px' },
  { label: '大', value: 'large', size: '18px' }
]

// 颜色方案选项
const colorSchemeOptions = [
  { label: '蓝色', value: 'blue', color: '#007bff' },
  { label: '绿色', value: 'green', color: '#28a745' },
  { label: '紫色', value: 'purple', color: '#6f42c1' },
  { label: '橙色', value: 'orange', color: '#fd7e14' }
]

/**
 * 全局设置管理 Composable
 * @returns {Object} 全局设置相关的响应式数据和方法
 */
export function useGlobalSettings() {
  // 响应式状态
  const settings = ref({ ...defaultGlobalSettings })
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
        SETTING_CATEGORIES.GLOBAL,
        'app',
        defaultGlobalSettings
      )
      
      settings.value = { ...defaultGlobalSettings, ...savedSettings }
      
      // 应用主题设置
      applyTheme(settings.value.theme)
      
      // 应用字体大小设置
      applyFontSize(settings.value.fontSize)
      
      // 应用颜色方案设置
      applyColorScheme(settings.value.colorScheme)
      
      // 监听设置变化
      unsubscribe = settingsPersistence.addListener(
        SETTING_CATEGORIES.GLOBAL,
        handleSettingsChange
      )
      
    } catch (err) {
      console.error('初始化全局设置失败:', err)
      error.value = err.message
      // 使用默认设置作为后备
      settings.value = { ...defaultGlobalSettings }
    } finally {
      isLoading.value = false
    }
  }

  // 处理设置变化
  const handleSettingsChange = ({ category, key, value }) => {
    if (category === SETTING_CATEGORIES.GLOBAL && key === 'app') {
      settings.value = { ...settings.value, ...value }
    }
  }

  // 更新设置
  const updateSettings = async (newSettings, options = {}) => {
    try {
      const updatedSettings = { ...settings.value, ...newSettings }
      
      // 立即更新本地状态
      settings.value = updatedSettings
      
      // 应用视觉设置
      if (newSettings.theme !== undefined) {
        applyTheme(newSettings.theme)
      }
      if (newSettings.fontSize !== undefined) {
        applyFontSize(newSettings.fontSize)
      }
      if (newSettings.colorScheme !== undefined) {
        applyColorScheme(newSettings.colorScheme)
      }
      
      // 保存到持久化存储
      await settingsPersistence.saveSettings(
        SETTING_CATEGORIES.GLOBAL,
        'app',
        updatedSettings,
        {
          immediate: options.immediate || false,
          backup: options.backup !== false,
          notify: options.notify !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig('global', updatedSettings)
      
    } catch (err) {
      console.error('更新全局设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 重置设置
  const resetSettings = async (options = {}) => {
    try {
      const defaultSettingsData = { ...defaultGlobalSettings }
      
      // 立即更新本地状态
      settings.value = defaultSettingsData
      
      // 应用默认视觉设置
      applyTheme(defaultSettingsData.theme)
      applyFontSize(defaultSettingsData.fontSize)
      applyColorScheme(defaultSettingsData.colorScheme)
      
      // 重置持久化存储
      await settingsPersistence.resetSettings(
        SETTING_CATEGORIES.GLOBAL,
        'app'
      )
      
      // 保存默认设置
      await settingsPersistence.saveSettings(
        SETTING_CATEGORIES.GLOBAL,
        'app',
        defaultSettingsData,
        {
          immediate: true,
          backup: options.backup !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig('global', defaultSettingsData)
      
    } catch (err) {
      console.error('重置全局设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 导出设置
  const exportSettings = async () => {
    try {
      return await settingsPersistence.exportAllSettings()
    } catch (err) {
      console.error('导出全局设置失败:', err)
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
      console.error('导入全局设置失败:', err)
      throw err
    }
  }

  // 应用主题
  const applyTheme = (theme) => {
    const root = document.documentElement
    
    if (theme === 'auto') {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }
    
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
  }

  // 应用字体大小
  const applyFontSize = (fontSize) => {
    const root = document.documentElement
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    
    root.style.setProperty('--base-font-size', sizeMap[fontSize] || sizeMap.medium)
  }

  // 应用颜色方案
  const applyColorScheme = (colorScheme) => {
    const root = document.documentElement
    root.setAttribute('data-color-scheme', colorScheme)
  }

  // 计算属性
  const currentTheme = computed(() => {
    return themeOptions.find(option => option.value === settings.value.theme) || themeOptions[0]
  })

  const currentLanguage = computed(() => {
    return languageOptions.find(option => option.value === settings.value.language) || languageOptions[0]
  })

  const currentFontSize = computed(() => {
    return fontSizeOptions.find(option => option.value === settings.value.fontSize) || fontSizeOptions[1]
  })

  const currentColorScheme = computed(() => {
    return colorSchemeOptions.find(option => option.value === settings.value.colorScheme) || colorSchemeOptions[0]
  })

  // 设置分组
  const settingsSections = computed(() => {
    return {
      appearance: {
        title: '外观设置',
        icon: 'palette',
        settings: {
          theme: {
            label: '主题',
            type: 'select',
            options: themeOptions,
            value: settings.value.theme
          },
          language: {
            label: '语言',
            type: 'select',
            options: languageOptions,
            value: settings.value.language
          },
          fontSize: {
            label: '字体大小',
            type: 'select',
            options: fontSizeOptions,
            value: settings.value.fontSize
          },
          colorScheme: {
            label: '颜色方案',
            type: 'select',
            options: colorSchemeOptions,
            value: settings.value.colorScheme
          }
        }
      },
      
      experience: {
        title: '用户体验',
        icon: 'tune',
        settings: {
          animations: {
            label: '动画效果',
            type: 'switch',
            value: settings.value.animations
          },
          soundEnabled: {
            label: '声音效果',
            type: 'switch',
            value: settings.value.soundEnabled
          },
          vibrationEnabled: {
            label: '震动反馈',
            type: 'switch',
            value: settings.value.vibrationEnabled
          },
          autoSave: {
            label: '自动保存',
            type: 'switch',
            value: settings.value.autoSave
          }
        }
      },
      
      notifications: {
        title: '通知设置',
        icon: 'notifications',
        settings: {
          'notifications.enabled': {
            label: '启用通知',
            type: 'switch',
            value: settings.value.notifications.enabled
          },
          'notifications.training': {
            label: '训练提醒',
            type: 'switch',
            value: settings.value.notifications.training
          },
          'notifications.progress': {
            label: '进度通知',
            type: 'switch',
            value: settings.value.notifications.progress
          },
          'notifications.achievements': {
            label: '成就通知',
            type: 'switch',
            value: settings.value.notifications.achievements
          }
        }
      },
      
      privacy: {
        title: '隐私设置',
        icon: 'privacy_tip',
        settings: {
          'dataCollection.analytics': {
            label: '数据分析',
            type: 'switch',
            value: settings.value.dataCollection.analytics
          },
          'dataCollection.crashReports': {
            label: '崩溃报告',
            type: 'switch',
            value: settings.value.dataCollection.crashReports
          },
          'dataCollection.performance': {
            label: '性能数据',
            type: 'switch',
            value: settings.value.dataCollection.performance
          }
        }
      },
      
      accessibility: {
        title: '可访问性',
        icon: 'accessibility',
        settings: {
          'accessibility.highContrast': {
            label: '高对比度',
            type: 'switch',
            value: settings.value.accessibility.highContrast
          },
          'accessibility.largeText': {
            label: '大字体',
            type: 'switch',
            value: settings.value.accessibility.largeText
          },
          'accessibility.reduceMotion': {
            label: '减少动画',
            type: 'switch',
            value: settings.value.accessibility.reduceMotion
          }
        }
      }
    }
  })

  // 监听系统主题变化
  const setupThemeListener = () => {
    if (settings.value.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = (e) => {
        applyTheme('auto')
      }
      
      mediaQuery.addEventListener('change', handleThemeChange)
      
      return () => {
        mediaQuery.removeEventListener('change', handleThemeChange)
      }
    }
  }

  // 生命周期管理
  onMounted(() => {
    initSettings()
    setupThemeListener()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // 监听主题设置变化
  watch(() => settings.value.theme, (newTheme) => {
    setupThemeListener()
  })

  return {
    settings,
    isLoading,
    error,
    themeOptions,
    languageOptions,
    fontSizeOptions,
    colorSchemeOptions,
    currentTheme,
    currentLanguage,
    currentFontSize,
    currentColorScheme,
    settingsSections,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    applyTheme,
    applyFontSize,
    applyColorScheme
  }
}

export { 
  defaultGlobalSettings, 
  themeOptions, 
  languageOptions, 
  fontSizeOptions, 
  colorSchemeOptions 
}