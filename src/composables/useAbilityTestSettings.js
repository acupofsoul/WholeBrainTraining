import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import configService from '../services/configService'
import settingsPersistence, { SETTING_CATEGORIES } from '../services/settingsPersistence'

/**
 * 能力测试设置管理组合式函数
 * @param {string} testType - 测试类型 (attention, memory, calculation, thinking, comprehensive)
 * @returns {Object} 设置相关的响应式数据和方法
 */
export function useAbilityTestSettings(testType) {
  // 默认设置配置
  const defaultSettings = {
    attention: {
      selectedModules: ['sustained', 'selective', 'divided', 'executive'],
      difficulty: 'medium',
      mode: 'comprehensive',
      soundEnabled: true,
      progressHints: true,
      autoSave: true,
      breakInterval: 5,
      timeLimit: 'normal',
      feedbackMode: 'immediate'
    },
    memory: {
      selectedModules: ['number', 'image', 'word', 'sequence'],
      difficulty: 'medium',
      mode: 'comprehensive',
      enableHints: true,
      enableFeedback: true,
      enableProgress: true,
      questionCount: 20,
      timeLimit: 600,
      adaptiveDifficulty: false
    },
    calculation: {
      selectedModules: ['arithmetic', 'logic', 'sequence', 'mental'],
      difficulty: 'medium',
      questionCount: 20,
      timeLimit: 600,
      showHints: true,
      enableFeedback: true,
      adaptiveDifficulty: false
    },
    thinking: {
      selectedModules: ['logical', 'creative', 'critical', 'problem'],
      difficulty: 'medium',
      mode: 'comprehensive',
      timeLimit: 'normal',
      questionOrder: 'sequential',
      feedbackMode: 'delayed',
      hintMode: 'limited'
    },
    comprehensive: {
      selectedModules: ['logical', 'memory', 'processing', 'attention', 'verbal'],
      difficulty: 'medium',
      duration: 30,
      adaptiveDifficulty: true,
      detailedFeedback: true,
      timeWarning: true
    }
  }

  // 难度等级配置
  const difficultyLevels = {
    attention: [
      { value: 'easy', name: '简单', icon: '🟢', description: '基础注意力训练，适合初学者' },
      { value: 'medium', name: '中等', icon: '🟡', description: '标准难度，适合大多数人' },
      { value: 'hard', name: '困难', icon: '🟠', description: '高难度训练，需要较强基础' },
      { value: 'expert', name: '专家', icon: '🔴', description: '专家级别，极具挑战性' }
    ],
    memory: [
      { value: 'easy', name: '简单', description: '基础记忆测试' },
      { value: 'medium', name: '中等', description: '标准记忆测试' },
      { value: 'hard', name: '困难', description: '高难度记忆测试' },
      { value: 'adaptive', name: '自适应', description: '根据表现调整难度' }
    ],
    calculation: [
      { value: 'easy', name: '简单', icon: '🟢', description: '基础计算，适合初学者' },
      { value: 'medium', name: '中等', icon: '🟡', description: '中等难度，适合大多数人' },
      { value: 'hard', name: '困难', icon: '🟠', description: '高难度计算，需要较强基础' },
      { value: 'expert', name: '专家', icon: '🔴', description: '专家级别，极具挑战性' }
    ],
    thinking: [
      { value: 'easy', name: '简单', description: '基础题目，适合初学者' },
      { value: 'medium', name: '中等', description: '标准难度，适合大多数人' },
      { value: 'hard', name: '困难', description: '挑战性题目，适合高水平用户' },
      { value: 'expert', name: '专家', description: '极具挑战性，适合专业人士' }
    ],
    comprehensive: [
      { value: 'easy', name: '简单', description: '适合初学者，题目相对简单，时间充裕' },
      { value: 'medium', name: '中等', description: '适合一般用户，难度适中，时间合理' },
      { value: 'hard', name: '困难', description: '适合高水平用户，题目复杂，时间紧张' },
      { value: 'expert', name: '专家', description: '适合专业人士，极具挑战性' }
    ]
  }

  // 测试模块配置
  const testModules = {
    attention: [
      { id: 'sustained', name: '持续注意力', icon: '⏱️', description: '测试长时间保持注意力的能力', duration: 8, questions: 20 },
      { id: 'selective', name: '选择性注意力', icon: '🎯', description: '测试在干扰中选择目标的能力', duration: 6, questions: 15 },
      { id: 'divided', name: '分配性注意力', icon: '🔄', description: '测试同时处理多个任务的能力', duration: 10, questions: 25 },
      { id: 'executive', name: '执行注意力', icon: '🧠', description: '测试注意力控制和调节能力', duration: 12, questions: 30 }
    ],
    memory: [
      { key: 'number', name: '数字记忆', icon: '🔢', description: '测试数字序列记忆能力', questionCount: 15, duration: 8 },
      { key: 'image', name: '图像记忆', icon: '🖼️', description: '测试视觉图像记忆能力', questionCount: 12, duration: 10 },
      { key: 'word', name: '单词记忆', icon: '📝', description: '测试词汇记忆能力', questionCount: 20, duration: 12 },
      { key: 'sequence', name: '序列记忆', icon: '🔗', description: '测试序列顺序记忆能力', questionCount: 18, duration: 15 }
    ],
    calculation: [
      { key: 'arithmetic', name: '基础运算', icon: '➕', description: '加减乘除等基础数学运算', estimatedTime: 5 },
      { key: 'logic', name: '逻辑推理', icon: '🧠', description: '数学逻辑和推理能力测试', estimatedTime: 8 },
      { key: 'sequence', name: '数字序列', icon: '🔢', description: '数字规律识别和序列推理', estimatedTime: 6 },
      { key: 'mental', name: '心算能力', icon: '⚡', description: '快速心算和数字处理能力', estimatedTime: 7 }
    ],
    thinking: [
      { id: 'logical', name: '逻辑思维测试', description: '评估逻辑推理、演绎归纳能力', icon: '🧠', duration: 15 },
      { id: 'creative', name: '创造思维测试', description: '评估创新思维、发散思维能力', icon: '💡', duration: 20 },
      { id: 'critical', name: '批判思维测试', description: '评估分析判断、质疑评价能力', icon: '🔍', duration: 18 },
      { id: 'problem', name: '问题解决测试', description: '评估问题分析、解决策略能力', icon: '🎯', duration: 25 }
    ],
    comprehensive: [
      { id: 'logical', name: '逻辑推理', icon: '🧩', estimatedTime: 8 },
      { id: 'memory', name: '工作记忆', icon: '🧠', estimatedTime: 6 },
      { id: 'processing', name: '处理速度', icon: '⚡', estimatedTime: 5 },
      { id: 'attention', name: '注意力', icon: '👁️', estimatedTime: 7 },
      { id: 'verbal', name: '语言理解', icon: '📝', estimatedTime: 9 }
    ]
  }

  // 测评模式配置
  const assessmentModes = {
    attention: [
      { value: 'quick', name: '快速测评', icon: '⚡', description: '15分钟快速评估' },
      { value: 'standard', name: '标准测评', icon: '📊', description: '30分钟全面评估' },
      { value: 'comprehensive', name: '综合测评', icon: '🎯', description: '45分钟深度评估' },
      { value: 'adaptive', name: '自适应测评', icon: '🔄', description: '根据表现调整难度' }
    ],
    memory: [
      { value: 'comprehensive', name: '综合测评', description: '全面评估各项记忆能力' },
      { value: 'quick', name: '快速测评', description: '快速评估核心记忆能力' },
      { value: 'detailed', name: '详细测评', description: '深入评估特定记忆类型' }
    ],
    thinking: [
      { value: 'comprehensive', name: '综合测评', description: '全面评估各项思维能力' },
      { value: 'focused', name: '专项测评', description: '重点评估特定思维能力' },
      { value: 'adaptive', name: '自适应测评', description: '根据表现动态调整难度' }
    ]
  }

  // 获取当前设置
  const settings = ref({ ...defaultSettings[testType] || {} })
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
        SETTING_CATEGORIES.ABILITY_TEST,
        testType,
        defaultSettings[testType] || {}
      )
      
      settings.value = { ...defaultSettings[testType], ...savedSettings }
      
      // 监听设置变化
      unsubscribe = settingsPersistence.addListener(
        SETTING_CATEGORIES.ABILITY_TEST,
        handleSettingsChange
      )
      
    } catch (err) {
      console.error('初始化设置失败:', err)
      error.value = err.message
      // 使用默认设置作为后备
      settings.value = { ...defaultSettings[testType] || {} }
    } finally {
      isLoading.value = false
    }
  }

  // 处理设置变化
  const handleSettingsChange = ({ category, key, value }) => {
    if (category === SETTING_CATEGORIES.ABILITY_TEST && key === testType) {
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
        SETTING_CATEGORIES.ABILITY_TEST,
        testType,
        updatedSettings,
        {
          immediate: options.immediate || false,
          backup: options.backup !== false,
          notify: options.notify !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig(`abilityTest.${testType}`, updatedSettings)
      
    } catch (err) {
      console.error('更新设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 重置设置
  const resetSettings = async (options = {}) => {
    try {
      const defaultSettingsData = { ...defaultSettings[testType] || {} }
      
      // 立即更新本地状态
      settings.value = defaultSettingsData
      
      // 重置持久化存储
      await settingsPersistence.resetSettings(
        SETTING_CATEGORIES.ABILITY_TEST,
        testType
      )
      
      // 保存默认设置
      await settingsPersistence.saveSettings(
        SETTING_CATEGORIES.ABILITY_TEST,
        testType,
        defaultSettingsData,
        {
          immediate: true,
          backup: options.backup !== false
        }
      )
      
      // 同时更新配置服务（保持兼容性）
      configService.setConfig(`abilityTest.${testType}`, defaultSettingsData)
      
    } catch (err) {
      console.error('重置设置失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 导出设置
  const exportSettings = async () => {
    try {
      return await settingsPersistence.exportAllSettings()
    } catch (err) {
      console.error('导出设置失败:', err)
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
      console.error('导入设置失败:', err)
      throw err
    }
  }

  // 生命周期管理
  onMounted(() => {
    initSettings()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // 获取设置分类
  const settingsSections = computed(() => {
    const sections = []

    // 基础设置
    sections.push({
      title: '基础设置',
      settings: [
        {
          key: 'difficulty',
          label: '难度等级',
          type: 'select',
          value: settings.value.difficulty,
          options: difficultyLevels[testType] || [],
          description: '选择适合您水平的测试难度'
        }
      ]
    })

    // 模块选择
    if (testModules[testType]) {
      sections.push({
        title: '测试模块',
        settings: [
          {
            key: 'selectedModules',
            label: '选择模块',
            type: 'multiSelect',
            value: settings.value.selectedModules,
            options: testModules[testType],
            description: '选择要进行的测试模块'
          }
        ]
      })
    }

    // 测评模式（如果有）
    if (assessmentModes[testType]) {
      sections[0].settings.push({
        key: 'mode',
        label: '测评模式',
        type: 'select',
        value: settings.value.mode,
        options: assessmentModes[testType],
        description: '选择测评的详细程度'
      })
    }

    // 个性化设置
    const personalSettings = []
    
    if (settings.value.hasOwnProperty('questionCount')) {
      personalSettings.push({
        key: 'questionCount',
        label: '题目数量',
        type: 'select',
        value: settings.value.questionCount,
        options: [
          { value: 10, label: '10题 (快速测评)' },
          { value: 20, label: '20题 (标准测评)' },
          { value: 30, label: '30题 (深度测评)' }
        ],
        description: '选择测试题目数量'
      })
    }

    if (settings.value.hasOwnProperty('timeLimit')) {
      personalSettings.push({
        key: 'timeLimit',
        label: '时间限制',
        type: 'select',
        value: settings.value.timeLimit,
        options: [
          { value: 300, label: '5分钟' },
          { value: 600, label: '10分钟' },
          { value: 900, label: '15分钟' },
          { value: 0, label: '无限制' }
        ],
        description: '设置测试时间限制'
      })
    }

    if (settings.value.hasOwnProperty('duration')) {
      personalSettings.push({
        key: 'duration',
        label: '测试时长',
        type: 'slider',
        value: settings.value.duration,
        min: 15,
        max: 60,
        step: 5,
        unit: '分钟',
        description: '设置总测试时长'
      })
    }

    // 功能开关
    const toggleSettings = []
    
    if (settings.value.hasOwnProperty('soundEnabled')) {
      toggleSettings.push({
        key: 'soundEnabled',
        label: '音效提示',
        type: 'toggle',
        value: settings.value.soundEnabled,
        description: '启用测试过程中的音效提示'
      })
    }

    if (settings.value.hasOwnProperty('enableHints') || settings.value.hasOwnProperty('showHints')) {
      const key = settings.value.hasOwnProperty('enableHints') ? 'enableHints' : 'showHints'
      toggleSettings.push({
        key,
        label: '提示功能',
        type: 'toggle',
        value: settings.value[key],
        description: '在困难题目中显示解题提示'
      })
    }

    if (settings.value.hasOwnProperty('enableFeedback')) {
      toggleSettings.push({
        key: 'enableFeedback',
        label: '即时反馈',
        type: 'toggle',
        value: settings.value.enableFeedback,
        description: '显示答题后的即时反馈'
      })
    }

    if (settings.value.hasOwnProperty('progressHints') || settings.value.hasOwnProperty('enableProgress')) {
      const key = settings.value.hasOwnProperty('progressHints') ? 'progressHints' : 'enableProgress'
      toggleSettings.push({
        key,
        label: '进度提示',
        type: 'toggle',
        value: settings.value[key],
        description: '显示测试进度信息'
      })
    }

    if (settings.value.hasOwnProperty('autoSave')) {
      toggleSettings.push({
        key: 'autoSave',
        label: '自动保存',
        type: 'toggle',
        value: settings.value.autoSave,
        description: '自动保存测试结果'
      })
    }

    if (settings.value.hasOwnProperty('adaptiveDifficulty')) {
      toggleSettings.push({
        key: 'adaptiveDifficulty',
        label: '自适应难度',
        type: 'toggle',
        value: settings.value.adaptiveDifficulty,
        description: '根据表现自动调整难度'
      })
    }

    if (settings.value.hasOwnProperty('detailedFeedback')) {
      toggleSettings.push({
        key: 'detailedFeedback',
        label: '详细反馈',
        type: 'toggle',
        value: settings.value.detailedFeedback,
        description: '提供详细的能力分析反馈'
      })
    }

    if (settings.value.hasOwnProperty('timeWarning')) {
      toggleSettings.push({
        key: 'timeWarning',
        label: '时间警告',
        type: 'toggle',
        value: settings.value.timeWarning,
        description: '在时间不足时显示警告'
      })
    }

    if (personalSettings.length > 0) {
      sections.push({
        title: '个性化设置',
        settings: personalSettings
      })
    }

    if (toggleSettings.length > 0) {
      sections.push({
        title: '功能设置',
        settings: toggleSettings
      })
    }

    return sections
  })

  // 计算预计时长
  const estimatedDuration = computed(() => {
    if (!testModules[testType] || !settings.value.selectedModules) {
      return settings.value.duration || 30
    }

    const selectedModuleData = testModules[testType].filter(module => 
      settings.value.selectedModules.includes(module.id || module.key)
    )

    return selectedModuleData.reduce((total, module) => {
      return total + (module.duration || module.estimatedTime || 5)
    }, 0)
  })

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    settingsSections,
    estimatedDuration,
    difficultyLevels: difficultyLevels[testType] || [],
    testModules: testModules[testType] || [],
    assessmentModes: assessmentModes[testType] || []
  }
}

// 导出默认设置用于其他组件
export const abilityTestDefaultSettings = {
  attention: {
    selectedModules: ['sustained', 'selective', 'divided', 'executive'],
    difficulty: 'medium',
    mode: 'comprehensive',
    soundEnabled: true,
    progressHints: true,
    autoSave: true,
    breakInterval: 5,
    timeLimit: 'normal',
    feedbackMode: 'immediate'
  },
  memory: {
    selectedModules: ['number', 'image', 'word', 'sequence'],
    difficulty: 'medium',
    mode: 'comprehensive',
    enableHints: true,
    enableFeedback: true,
    enableProgress: true,
    questionCount: 20,
    timeLimit: 600,
    adaptiveDifficulty: false
  },
  calculation: {
    selectedModules: ['arithmetic', 'logic', 'sequence', 'mental'],
    difficulty: 'medium',
    questionCount: 20,
    timeLimit: 600,
    showHints: true,
    enableFeedback: true,
    adaptiveDifficulty: false
  },
  thinking: {
    selectedModules: ['logical', 'creative', 'critical', 'problem'],
    difficulty: 'medium',
    mode: 'comprehensive',
    timeLimit: 'normal',
    questionOrder: 'sequential',
    feedbackMode: 'delayed',
    hintMode: 'limited'
  },
  comprehensive: {
    selectedModules: ['logical', 'memory', 'processing', 'attention', 'verbal'],
    difficulty: 'medium',
    duration: 30,
    adaptiveDifficulty: true,
    detailedFeedback: true,
    timeWarning: true
  }
}