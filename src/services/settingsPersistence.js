/**
 * 设置持久化服务 - 优化的设置数据存储和恢复机制
 * 提供版本管理、数据同步、错误恢复等功能
 */

import localforage from 'localforage'
// 原生JavaScript实现debounce函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 设置存储键名
const SETTINGS_KEYS = {
  USER_SETTINGS: 'user_settings_v2',
  TRAINING_SETTINGS: 'training_settings_v2',
  ABILITY_TEST_SETTINGS: 'ability_test_settings_v2',
  GLOBAL_SETTINGS: 'global_settings_v2',
  SETTINGS_BACKUP: 'settings_backup_v2',
  SETTINGS_VERSION: 'settings_version',
  LAST_SYNC_TIME: 'last_sync_time'
}

// 当前设置版本
const CURRENT_VERSION = '2.0.0'

// 设置分类
const SETTING_CATEGORIES = {
  TRAINING: 'training',
  ABILITY_TEST: 'ability_test',
  GLOBAL: 'global',
  USER: 'user'
}

class SettingsPersistenceService {
  constructor() {
    this.listeners = new Map()
    this.syncQueue = new Set()
    this.isInitialized = false
    this.lastSyncTime = null
    
    // 防抖保存函数
    this.debouncedSave = debounce(this._performSave.bind(this), 500)
    
    // 初始化存储
    this.init()
  }

  /**
   * 初始化设置持久化服务
   */
  async init() {
    try {
      // 检查版本兼容性
      await this._checkVersionCompatibility()
      
      // 恢复上次同步时间
      this.lastSyncTime = await localforage.getItem(SETTINGS_KEYS.LAST_SYNC_TIME)
      
      // 创建自动备份
      await this._createAutoBackup()
      
      this.isInitialized = true
      console.log('设置持久化服务初始化完成')
    } catch (error) {
      console.error('设置持久化服务初始化失败:', error)
      // 尝试从备份恢复
      await this._restoreFromBackup()
    }
  }

  /**
   * 保存设置数据
   * @param {string} category - 设置分类
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   * @param {Object} options - 保存选项
   */
  async saveSettings(category, key, value, options = {}) {
    const {
      immediate = false,
      backup = true,
      notify = true
    } = options

    try {
      const settingsKey = this._getSettingsKey(category)
      const currentSettings = await this._getSettings(settingsKey) || {}
      
      // 更新设置值
      if (key) {
        currentSettings[key] = value
      } else {
        Object.assign(currentSettings, value)
      }
      
      // 添加元数据
      currentSettings._metadata = {
        lastModified: Date.now(),
        version: CURRENT_VERSION,
        category
      }
      
      if (immediate) {
        await this._performSave(settingsKey, currentSettings)
      } else {
        // 添加到同步队列
        this.syncQueue.add({ key: settingsKey, data: currentSettings })
        this.debouncedSave()
      }
      
      // 创建备份
      if (backup) {
        await this._createSettingsBackup(category, currentSettings)
      }
      
      // 通知监听器
      if (notify) {
        this._notifyListeners(category, key, value)
      }
      
      return currentSettings
    } catch (error) {
      console.error('保存设置失败:', error)
      throw new Error(`保存设置失败: ${error.message}`)
    }
  }

  /**
   * 获取设置数据
   * @param {string} category - 设置分类
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   */
  async getSettings(category, key = null, defaultValue = null) {
    try {
      const settingsKey = this._getSettingsKey(category)
      const settings = await this._getSettings(settingsKey)
      
      if (!settings) {
        return defaultValue
      }
      
      // 检查数据完整性
      if (!this._validateSettings(settings)) {
        console.warn('设置数据损坏，尝试从备份恢复')
        return await this._restoreFromBackup(category, key, defaultValue)
      }
      
      if (key) {
        return settings[key] !== undefined ? settings[key] : defaultValue
      }
      
      return settings
    } catch (error) {
      console.error('获取设置失败:', error)
      return defaultValue
    }
  }

  /**
   * 重置设置
   * @param {string} category - 设置分类
   * @param {string} key - 设置键名（可选）
   */
  async resetSettings(category, key = null) {
    try {
      const settingsKey = this._getSettingsKey(category)
      
      if (key) {
        // 重置特定键
        const settings = await this._getSettings(settingsKey) || {}
        delete settings[key]
        await this._performSave(settingsKey, settings)
      } else {
        // 重置整个分类
        await localforage.removeItem(settingsKey)
      }
      
      this._notifyListeners(category, key, null)
    } catch (error) {
      console.error('重置设置失败:', error)
      throw error
    }
  }

  /**
   * 导出所有设置
   */
  async exportAllSettings() {
    try {
      const exportData = {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
        settings: {}
      }
      
      for (const category of Object.values(SETTING_CATEGORIES)) {
        const settingsKey = this._getSettingsKey(category)
        const settings = await this._getSettings(settingsKey)
        if (settings) {
          exportData.settings[category] = settings
        }
      }
      
      return exportData
    } catch (error) {
      console.error('导出设置失败:', error)
      throw error
    }
  }

  /**
   * 导入设置
   * @param {Object} importData - 导入的设置数据
   * @param {Object} options - 导入选项
   */
  async importSettings(importData, options = {}) {
    const {
      merge = true,
      backup = true,
      validate = true
    } = options

    try {
      if (validate && !this._validateImportData(importData)) {
        throw new Error('导入数据格式无效')
      }
      
      // 创建导入前备份
      if (backup) {
        await this._createFullBackup('pre_import')
      }
      
      for (const [category, settings] of Object.entries(importData.settings)) {
        const settingsKey = this._getSettingsKey(category)
        
        if (merge) {
          const currentSettings = await this._getSettings(settingsKey) || {}
          const mergedSettings = { ...currentSettings, ...settings }
          await this._performSave(settingsKey, mergedSettings)
        } else {
          await this._performSave(settingsKey, settings)
        }
        
        this._notifyListeners(category, null, settings)
      }
      
      console.log('设置导入完成')
    } catch (error) {
      console.error('导入设置失败:', error)
      throw error
    }
  }

  /**
   * 添加设置变化监听器
   * @param {string} category - 设置分类
   * @param {Function} callback - 回调函数
   */
  addListener(category, callback) {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, new Set())
    }
    this.listeners.get(category).add(callback)
    
    // 返回取消监听的函数
    return () => {
      const categoryListeners = this.listeners.get(category)
      if (categoryListeners) {
        categoryListeners.delete(callback)
      }
    }
  }

  /**
   * 清理过期数据
   * @param {number} retentionDays - 保留天数
   */
  async cleanupExpiredData(retentionDays = 30) {
    try {
      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
      
      // 清理过期备份
      const backupKeys = await localforage.keys()
      for (const key of backupKeys) {
        if (key.includes('backup_') && key.includes('_')) {
          const timestamp = parseInt(key.split('_').pop())
          if (timestamp < cutoffTime) {
            await localforage.removeItem(key)
          }
        }
      }
      
      console.log('过期数据清理完成')
    } catch (error) {
      console.error('清理过期数据失败:', error)
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats() {
    try {
      const stats = {
        totalKeys: 0,
        settingsKeys: 0,
        backupKeys: 0,
        lastSyncTime: this.lastSyncTime,
        version: CURRENT_VERSION
      }
      
      const keys = await localforage.keys()
      stats.totalKeys = keys.length
      
      for (const key of keys) {
        if (Object.values(SETTINGS_KEYS).includes(key)) {
          stats.settingsKeys++
        } else if (key.includes('backup_')) {
          stats.backupKeys++
        }
      }
      
      return stats
    } catch (error) {
      console.error('获取存储统计失败:', error)
      return null
    }
  }

  // 私有方法

  /**
   * 获取设置存储键名
   */
  _getSettingsKey(category) {
    switch (category) {
      case SETTING_CATEGORIES.TRAINING:
        return SETTINGS_KEYS.TRAINING_SETTINGS
      case SETTING_CATEGORIES.ABILITY_TEST:
        return SETTINGS_KEYS.ABILITY_TEST_SETTINGS
      case SETTING_CATEGORIES.GLOBAL:
        return SETTINGS_KEYS.GLOBAL_SETTINGS
      case SETTING_CATEGORIES.USER:
        return SETTINGS_KEYS.USER_SETTINGS
      default:
        throw new Error(`未知的设置分类: ${category}`)
    }
  }

  /**
   * 获取设置数据
   */
  async _getSettings(key) {
    return await localforage.getItem(key)
  }

  /**
   * 执行保存操作
   */
  async _performSave(key, data) {
    if (typeof key === 'object') {
      // 批量保存
      for (const item of this.syncQueue) {
        await localforage.setItem(item.key, item.data)
      }
      this.syncQueue.clear()
    } else {
      // 单个保存
      await localforage.setItem(key, data)
    }
    
    // 更新同步时间
    this.lastSyncTime = Date.now()
    await localforage.setItem(SETTINGS_KEYS.LAST_SYNC_TIME, this.lastSyncTime)
  }

  /**
   * 检查版本兼容性
   */
  async _checkVersionCompatibility() {
    const storedVersion = await localforage.getItem(SETTINGS_KEYS.SETTINGS_VERSION)
    
    if (!storedVersion) {
      // 首次使用，设置版本
      await localforage.setItem(SETTINGS_KEYS.SETTINGS_VERSION, CURRENT_VERSION)
    } else if (storedVersion !== CURRENT_VERSION) {
      // 版本不匹配，执行迁移
      await this._migrateSettings(storedVersion, CURRENT_VERSION)
      await localforage.setItem(SETTINGS_KEYS.SETTINGS_VERSION, CURRENT_VERSION)
    }
  }

  /**
   * 迁移设置数据
   */
  async _migrateSettings(fromVersion, toVersion) {
    console.log(`迁移设置数据: ${fromVersion} -> ${toVersion}`)
    
    // 创建迁移前备份
    await this._createFullBackup('pre_migration')
    
    // 这里可以添加具体的迁移逻辑
    // 例如：重命名键名、转换数据格式等
  }

  /**
   * 创建自动备份
   */
  async _createAutoBackup() {
    try {
      const backupData = await this.exportAllSettings()
      const backupKey = `${SETTINGS_KEYS.SETTINGS_BACKUP}_auto_${Date.now()}`
      await localforage.setItem(backupKey, backupData)
    } catch (error) {
      console.error('创建自动备份失败:', error)
    }
  }

  /**
   * 创建设置备份
   */
  async _createSettingsBackup(category, settings) {
    try {
      const backupKey = `${SETTINGS_KEYS.SETTINGS_BACKUP}_${category}_${Date.now()}`
      await localforage.setItem(backupKey, settings)
    } catch (error) {
      console.error('创建设置备份失败:', error)
    }
  }

  /**
   * 创建完整备份
   */
  async _createFullBackup(suffix = '') {
    try {
      const backupData = await this.exportAllSettings()
      const backupKey = `${SETTINGS_KEYS.SETTINGS_BACKUP}_full_${suffix}_${Date.now()}`
      await localforage.setItem(backupKey, backupData)
    } catch (error) {
      console.error('创建完整备份失败:', error)
    }
  }

  /**
   * 从备份恢复
   */
  async _restoreFromBackup(category = null, key = null, defaultValue = null) {
    try {
      const backupKeys = await localforage.keys()
      const relevantBackups = backupKeys
        .filter(k => k.includes(SETTINGS_KEYS.SETTINGS_BACKUP))
        .filter(k => !category || k.includes(category))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop())
          const timestampB = parseInt(b.split('_').pop())
          return timestampB - timestampA
        })
      
      if (relevantBackups.length > 0) {
        const latestBackup = await localforage.getItem(relevantBackups[0])
        
        if (category && key) {
          return latestBackup.settings?.[category]?.[key] || defaultValue
        } else if (category) {
          return latestBackup.settings?.[category] || defaultValue
        } else {
          // 恢复所有设置
          await this.importSettings(latestBackup, { merge: false, backup: false })
          return latestBackup
        }
      }
      
      return defaultValue
    } catch (error) {
      console.error('从备份恢复失败:', error)
      return defaultValue
    }
  }

  /**
   * 验证设置数据
   */
  _validateSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return false
    }
    
    // 检查元数据
    if (settings._metadata) {
      const { lastModified, version } = settings._metadata
      if (!lastModified || !version) {
        return false
      }
    }
    
    return true
  }

  /**
   * 验证导入数据
   */
  _validateImportData(data) {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    if (!data.version || !data.settings) {
      return false
    }
    
    return true
  }

  /**
   * 通知监听器
   */
  _notifyListeners(category, key, value) {
    const categoryListeners = this.listeners.get(category)
    if (categoryListeners) {
      for (const callback of categoryListeners) {
        try {
          callback({ category, key, value, timestamp: Date.now() })
        } catch (error) {
          console.error('监听器回调执行失败:', error)
        }
      }
    }
  }
}

// 创建单例实例
const settingsPersistence = new SettingsPersistenceService()

export default settingsPersistence
export { SETTING_CATEGORIES, SettingsPersistenceService }