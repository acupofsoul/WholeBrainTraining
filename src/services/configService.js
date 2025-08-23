/**
 * 配置服务 - 管理应用的默认配置和用户自定义设置
 */

// 默认配置定义
const DEFAULT_CONFIGS = {
  // 闪读训练配置
  imageFlash: {
    // 基础设置
    flashDuration: 1000,        // 闪现时长(ms)
    intervalDuration: 500,      // 间隔时长(ms)
    imageCount: 10,             // 图片数量
    imageSize: 'medium',        // 图片尺寸: small, medium, large
    
    // 训练模式
    mode: 'sequence',           // sequence, random, adaptive
    difficulty: 'normal',       // easy, normal, hard
    
    // 显示设置
    showProgress: true,         // 显示进度
    showTimer: true,            // 显示计时器
    showScore: true,            // 显示分数
    
    // 反馈设置
    enableSound: true,          // 启用声音
    enableVibration: false,     // 启用震动
    showCorrectAnswer: true,    // 显示正确答案
    
    // 高级设置
    autoStart: false,           // 自动开始
    pauseOnError: false,        // 错误时暂停
    adaptiveDifficulty: false   // 自适应难度
  },
  
  articleFlash: {
    // 基础设置
    flashDuration: 2000,        // 闪现时长(ms)
    intervalDuration: 1000,     // 间隔时长(ms)
    wordsPerFlash: 5,           // 每次闪现词数
    
    // 文章设置
    articleLength: 'medium',    // short, medium, long
    fontSize: 16,               // 字体大小
    fontFamily: 'sans-serif',   // 字体族
    
    // 训练模式
    mode: 'linear',             // linear, random, focus
    difficulty: 'normal',       // easy, normal, hard
    
    // 显示设置
    showProgress: true,
    showTimer: true,
    showScore: true,
    highlightKeywords: true,    // 高亮关键词
    
    // 理解测试
    enableComprehension: true,  // 启用理解测试
    questionCount: 3,           // 问题数量
    questionType: 'multiple',   // multiple, single, text
    
    // 高级设置
    autoStart: false,
    pauseOnError: false,
    adaptiveSpeed: false        // 自适应速度
  },
  
  // 基础训练配置
  expandVision: {
    // 基础设置
    gridSize: 5,                // 网格大小
    targetCount: 3,             // 目标数量
    displayDuration: 2000,      // 显示时长(ms)
    
    // 视觉设置
    targetColor: '#667eea',     // 目标颜色
    backgroundColor: '#f8f9fa', // 背景颜色
    targetShape: 'circle',      // 目标形状: circle, square, triangle
    
    // 训练模式
    mode: 'static',             // static, dynamic, tracking
    difficulty: 'normal',
    
    // 显示设置
    showGrid: true,             // 显示网格
    showProgress: true,
    showTimer: true,
    showScore: true,
    
    // 反馈设置
    enableSound: true,
    enableVibration: false,
    showTrajectory: false,      // 显示轨迹
    
    // 高级设置
    autoStart: false,
    randomPosition: true,       // 随机位置
    adaptiveDifficulty: false
  },
  
  attention: {
    // 基础设置
    focusDuration: 30000,       // 专注时长(ms)
    targetSize: 'medium',       // 目标尺寸
    distractorCount: 5,         // 干扰项数量
    
    // 注意力设置
    attentionType: 'selective', // selective, sustained, divided
    targetType: 'color',        // color, shape, motion, text
    
    // 视觉设置
    targetColor: '#667eea',
    backgroundColor: '#f8f9fa',
    distractorOpacity: 0.6,     // 干扰项透明度
    
    // 训练模式
    mode: 'focus',              // focus, switch, multi
    difficulty: 'normal',
    
    // 显示设置
    showProgress: true,
    showTimer: true,
    showScore: true,
    showInstructions: true,     // 显示说明
    
    // 反馈设置
    enableSound: true,
    enableVibration: false,
    realTimeFeedback: true,     // 实时反馈
    
    // 高级设置
    autoStart: false,
    adaptiveSpeed: false,
    eyeTrackingMode: false      // 眼动追踪模式
  },
  
  // 能力测试配置
  visualSearchTest: {
    // 测试设置
    testDuration: 300000,       // 测试时长(ms) - 5分钟
    itemCount: 20,              // 项目数量
    targetCount: 3,             // 目标数量
    
    // 视觉设置
    itemSize: 'medium',
    targetColor: '#667eea',
    backgroundColor: '#f8f9fa',
    
    // 测试模式
    testType: 'conjunction',    // feature, conjunction, spatial
    difficulty: 'normal',
    
    // 显示设置
    showProgress: true,
    showTimer: true,
    showInstructions: true,
    
    // 数据收集
    recordEyeMovement: false,   // 记录眼动
    recordReactionTime: true,   // 记录反应时间
    recordAccuracy: true,       // 记录准确率
    
    // 高级设置
    randomizeOrder: true,       // 随机顺序
    adaptiveDifficulty: false
  },
  
  attentionTest: {
    // 测试设置
    testDuration: 600000,       // 测试时长(ms) - 10分钟
    trialCount: 50,             // 试验次数
    
    // 注意力设置
    attentionType: 'sustained', // sustained, selective, divided
    stimulusType: 'visual',     // visual, auditory, mixed
    
    // 视觉设置
    stimulusSize: 'medium',
    targetColor: '#667eea',
    backgroundColor: '#f8f9fa',
    
    // 测试模式
    testType: 'cpt',            // cpt, ant, flanker
    difficulty: 'normal',
    
    // 显示设置
    showProgress: true,
    showTimer: true,
    showInstructions: true,
    
    // 数据收集
    recordReactionTime: true,
    recordAccuracy: true,
    recordLapses: true,         // 记录失误
    
    // 高级设置
    randomizeISI: true,         // 随机刺激间隔
    adaptiveDifficulty: false
  },
  
  detailObservationTest: {
    // 测试设置
    testDuration: 900000,       // 测试时长(ms) - 15分钟
    imageCount: 15,             // 图片数量
    observationTime: 30000,     // 观察时间(ms)
    
    // 图片设置
    imageType: 'complex',       // simple, complex, realistic
    imageSize: 'large',
    detailLevel: 'high',        // low, medium, high
    
    // 测试模式
    testType: 'comparison',     // memory, comparison, detection
    difficulty: 'normal',
    
    // 显示设置
    showProgress: true,
    showTimer: true,
    showInstructions: true,
    allowZoom: true,            // 允许缩放
    
    // 问题设置
    questionCount: 5,           // 每张图片的问题数
    questionType: 'multiple',   // multiple, single, text
    
    // 数据收集
    recordViewTime: true,       // 记录查看时间
    recordAccuracy: true,
    recordDetailLevel: true,    // 记录细节层次
    
    // 高级设置
    randomizeOrder: true,
    adaptiveDifficulty: false
  },
  
  // 全局设置
  global: {
    // 界面设置
    theme: 'light',             // light, dark, auto
    language: 'zh-CN',          // zh-CN, en-US
    fontSize: 'medium',         // small, medium, large
    
    // 数据设置
    autoSave: true,             // 自动保存
    saveInterval: 30000,        // 保存间隔(ms)
    dataRetention: 30,          // 数据保留天数
    
    // 通知设置
    enableNotifications: true,  // 启用通知
    soundVolume: 0.7,          // 声音音量
    vibrationIntensity: 0.5,   // 震动强度
    
    // 性能设置
    enableAnimations: true,     // 启用动画
    highPerformanceMode: false, // 高性能模式
    debugMode: false           // 调试模式
  }
}

// 配置验证规则
const VALIDATION_RULES = {
  imageFlash: {
    flashDuration: { min: 100, max: 10000, type: 'number' },
    intervalDuration: { min: 0, max: 5000, type: 'number' },
    imageCount: { min: 1, max: 100, type: 'number' },
    imageSize: { values: ['small', 'medium', 'large'], type: 'string' }
  },
  articleFlash: {
    flashDuration: { min: 500, max: 10000, type: 'number' },
    intervalDuration: { min: 0, max: 5000, type: 'number' },
    wordsPerFlash: { min: 1, max: 20, type: 'number' },
    fontSize: { min: 12, max: 24, type: 'number' }
  },
  expandVision: {
    gridSize: { min: 3, max: 10, type: 'number' },
    targetCount: { min: 1, max: 10, type: 'number' },
    displayDuration: { min: 500, max: 10000, type: 'number' }
  },
  attention: {
    focusDuration: { min: 5000, max: 300000, type: 'number' },
    distractorCount: { min: 0, max: 20, type: 'number' }
  }
}

class ConfigService {
  constructor() {
    this.configs = {}
    this.listeners = new Map()
    this.loadConfigs()
  }
  
  /**
   * 加载配置
   */
  loadConfigs() {
    try {
      const savedConfigs = localStorage.getItem('brainTraining_configs')
      if (savedConfigs) {
        this.configs = { ...DEFAULT_CONFIGS, ...JSON.parse(savedConfigs) }
      } else {
        this.configs = { ...DEFAULT_CONFIGS }
      }
    } catch (error) {
      console.warn('加载配置失败，使用默认配置:', error)
      this.configs = { ...DEFAULT_CONFIGS }
    }
  }
  
  /**
   * 保存配置
   */
  saveConfigs() {
    try {
      localStorage.setItem('brainTraining_configs', JSON.stringify(this.configs))
      return true
    } catch (error) {
      console.error('保存配置失败:', error)
      return false
    }
  }
  
  /**
   * 获取配置
   * @param {string} module - 模块名
   * @param {string} key - 配置键名（可选）
   * @returns {any} 配置值
   */
  getConfig(module, key = null) {
    if (!this.configs[module]) {
      console.warn(`模块 ${module} 的配置不存在`)
      return key ? undefined : {}
    }
    
    if (key) {
      return this.configs[module][key]
    }
    
    return { ...this.configs[module] }
  }
  
  /**
   * 设置配置
   * @param {string} module - 模块名
   * @param {string|object} key - 配置键名或配置对象
   * @param {any} value - 配置值（当key为字符串时使用）
   * @returns {boolean} 是否设置成功
   */
  setConfig(module, key, value = null) {
    if (!this.configs[module]) {
      this.configs[module] = {}
    }
    
    let updates = {}
    
    if (typeof key === 'object') {
      // 批量更新
      updates = key
    } else {
      // 单个更新
      updates[key] = value
    }
    
    // 验证配置
    for (const [configKey, configValue] of Object.entries(updates)) {
      if (!this.validateConfig(module, configKey, configValue)) {
        console.warn(`配置验证失败: ${module}.${configKey} = ${configValue}`)
        return false
      }
    }
    
    // 应用更新
    Object.assign(this.configs[module], updates)
    
    // 保存配置
    const saved = this.saveConfigs()
    
    // 通知监听器
    if (saved) {
      this.notifyListeners(module, updates)
    }
    
    return saved
  }
  
  /**
   * 重置配置到默认值
   * @param {string} module - 模块名
   * @param {string} key - 配置键名（可选，不提供则重置整个模块）
   * @returns {boolean} 是否重置成功
   */
  resetConfig(module, key = null) {
    if (!DEFAULT_CONFIGS[module]) {
      console.warn(`模块 ${module} 的默认配置不存在`)
      return false
    }
    
    if (key) {
      if (DEFAULT_CONFIGS[module][key] !== undefined) {
        this.configs[module][key] = DEFAULT_CONFIGS[module][key]
      } else {
        console.warn(`配置 ${module}.${key} 不存在`)
        return false
      }
    } else {
      this.configs[module] = { ...DEFAULT_CONFIGS[module] }
    }
    
    const saved = this.saveConfigs()
    
    if (saved) {
      const updates = key ? { [key]: this.configs[module][key] } : this.configs[module]
      this.notifyListeners(module, updates)
    }
    
    return saved
  }
  
  /**
   * 获取默认配置
   * @param {string} module - 模块名
   * @param {string} key - 配置键名（可选）
   * @returns {any} 默认配置值
   */
  getDefaultConfig(module, key = null) {
    if (!DEFAULT_CONFIGS[module]) {
      return key ? undefined : {}
    }
    
    if (key) {
      return DEFAULT_CONFIGS[module][key]
    }
    
    return { ...DEFAULT_CONFIGS[module] }
  }
  
  /**
   * 验证配置值
   * @param {string} module - 模块名
   * @param {string} key - 配置键名
   * @param {any} value - 配置值
   * @returns {boolean} 是否有效
   */
  validateConfig(module, key, value) {
    const rules = VALIDATION_RULES[module]
    if (!rules || !rules[key]) {
      return true // 没有验证规则则认为有效
    }
    
    const rule = rules[key]
    
    // 类型检查
    if (rule.type && typeof value !== rule.type) {
      return false
    }
    
    // 数值范围检查
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) return false
      if (rule.max !== undefined && value > rule.max) return false
    }
    
    // 枚举值检查
    if (rule.values && !rule.values.includes(value)) {
      return false
    }
    
    return true
  }
  
  /**
   * 添加配置变化监听器
   * @param {string} module - 模块名
   * @param {function} callback - 回调函数
   * @returns {function} 取消监听的函数
   */
  addListener(module, callback) {
    if (!this.listeners.has(module)) {
      this.listeners.set(module, new Set())
    }
    
    this.listeners.get(module).add(callback)
    
    // 返回取消监听的函数
    return () => {
      const moduleListeners = this.listeners.get(module)
      if (moduleListeners) {
        moduleListeners.delete(callback)
        if (moduleListeners.size === 0) {
          this.listeners.delete(module)
        }
      }
    }
  }
  
  /**
   * 通知监听器
   * @param {string} module - 模块名
   * @param {object} updates - 更新的配置
   */
  notifyListeners(module, updates) {
    const moduleListeners = this.listeners.get(module)
    if (moduleListeners) {
      moduleListeners.forEach(callback => {
        try {
          callback(updates, this.configs[module])
        } catch (error) {
          console.error('配置监听器执行失败:', error)
        }
      })
    }
  }
  
  /**
   * 导出配置
   * @param {string[]} modules - 要导出的模块（可选，不提供则导出全部）
   * @returns {object} 配置对象
   */
  exportConfigs(modules = null) {
    if (modules) {
      const exported = {}
      modules.forEach(module => {
        if (this.configs[module]) {
          exported[module] = { ...this.configs[module] }
        }
      })
      return exported
    }
    
    return { ...this.configs }
  }
  
  /**
   * 导入配置
   * @param {object} configs - 配置对象
   * @param {boolean} merge - 是否合并（默认true）
   * @returns {boolean} 是否导入成功
   */
  importConfigs(configs, merge = true) {
    try {
      if (merge) {
        // 合并配置
        for (const [module, moduleConfig] of Object.entries(configs)) {
          if (typeof moduleConfig === 'object') {
            this.configs[module] = {
              ...this.configs[module],
              ...moduleConfig
            }
          }
        }
      } else {
        // 替换配置
        this.configs = { ...DEFAULT_CONFIGS, ...configs }
      }
      
      const saved = this.saveConfigs()
      
      if (saved) {
        // 通知所有模块的监听器
        for (const module of Object.keys(configs)) {
          this.notifyListeners(module, this.configs[module])
        }
      }
      
      return saved
    } catch (error) {
      console.error('导入配置失败:', error)
      return false
    }
  }
  
  /**
   * 清除所有配置
   */
  clearConfigs() {
    try {
      localStorage.removeItem('brainTraining_configs')
      this.configs = { ...DEFAULT_CONFIGS }
      
      // 通知所有监听器
      for (const module of this.listeners.keys()) {
        this.notifyListeners(module, this.configs[module])
      }
      
      return true
    } catch (error) {
      console.error('清除配置失败:', error)
      return false
    }
  }
}

// 创建单例实例
const configService = new ConfigService()

export default configService
export { DEFAULT_CONFIGS, VALIDATION_RULES }