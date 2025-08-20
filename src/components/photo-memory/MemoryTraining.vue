<template>
  <div class="memory-training">
    <div class="training-header">
      <h2>记忆训练</h2>
      <p>通过多种类型的记忆练习全面提升记忆力</p>
    </div>

    <div class="training-content">
      <div v-if="!isTraining" class="start-screen">
        <!-- 训练模式选择 -->
        <div class="mode-selection">
          <h3>选择训练模式</h3>
          <div class="mode-cards">
            <div 
              v-for="mode in trainingModes" 
              :key="mode.id"
              class="mode-card"
              :class="{ active: settings.mode === mode.id }"
              @click="settings.mode = mode.id"
            >
              <div class="mode-icon">{{ mode.icon }}</div>
              <h4>{{ mode.name }}</h4>
              <p>{{ mode.description }}</p>
              <div class="mode-difficulty">{{ mode.difficulty }}</div>
            </div>
          </div>
        </div>

        <!-- 训练设置 -->
        <div class="settings">
          <div class="settings-grid">
            <div class="setting-item">
              <label>难度等级：</label>
              <select v-model="settings.difficulty">
                <option value="beginner">初学者</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
                <option value="expert">专家</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>记忆时间（秒）：</label>
              <input v-model.number="settings.memoryTime" type="number" min="3" max="60" />
            </div>
            
            <div class="setting-item">
              <label>项目数量：</label>
              <input v-model.number="settings.itemCount" type="number" min="3" max="20" />
            </div>
            
            <div class="setting-item">
              <label>显示方式：</label>
              <select v-model="settings.displayMode">
                <option value="grid">网格显示</option>
                <option value="sequence">序列显示</option>
                <option value="flash">闪现显示</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>背景音效：</label>
              <select v-model="settings.backgroundSound">
                <option value="none">无</option>
                <option value="nature">自然音</option>
                <option value="white-noise">白噪音</option>
                <option value="classical">古典音乐</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>提示功能：</label>
              <input type="checkbox" v-model="settings.enableHints" />
            </div>
            
            <div class="setting-item" v-if="settings.mode === 'images'">
              <label>图像主题：</label>
              <select v-model="settings.imageTheme">
                <option value="geometric">几何图形</option>
                <option value="nature">自然元素</option>
                <option value="animals">动物图案</option>
                <option value="food">食物图标</option>
                <option value="objects">日常物品</option>
              </select>
            </div>
            
            <div class="setting-item" v-if="settings.mode === 'words'">
              <label>单词类别：</label>
              <select v-model="settings.wordCategory">
                <option value="mixed">混合类别</option>
                <option value="fruits">水果类</option>
                <option value="technology">科技类</option>
                <option value="animals">动物类</option>
                <option value="academic">学术类</option>
                <option value="colors">颜色类</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="training-stats">
          <h3>训练统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.totalSessions }}</div>
              <div class="stat-label">总训练次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ statistics.averageAccuracy }}%</div>
              <div class="stat-label">平均准确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ statistics.bestScore }}</div>
              <div class="stat-label">最佳成绩</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ statistics.currentStreak }}</div>
              <div class="stat-label">连续成功</div>
            </div>
          </div>
        </div>
        
        <button @click="startTraining" class="start-btn">
          <span>🚀</span>
          开始{{ getCurrentModeConfig().name }}训练
        </button>
      </div>

      <div v-else class="training-area">
        <!-- 记忆阶段 -->
        <div v-if="phase === 'memorize'" class="memorize-phase">
          <div class="phase-header">
            <h3>记忆阶段</h3>
            <div class="countdown">{{ countdown }}秒</div>
          </div>
          
          <!-- 数字记忆 -->
          <div v-if="settings.mode === 'numbers'" class="numbers-display">
            <div class="numbers-grid">
              <div 
                v-for="(number, index) in currentItems" 
                :key="index"
                class="number-item"
              >
                {{ number }}
              </div>
            </div>
          </div>
          
          <!-- 图像记忆 -->
          <div v-if="settings.mode === 'images'" class="images-display">
            <div class="images-grid" :class="settings.displayMode">
              <div 
                v-for="(image, index) in currentItems" 
                :key="index"
                class="image-item"
                :style="{ backgroundColor: image.color }"
              >
                {{ image.symbol }}
              </div>
            </div>
          </div>
          
          <!-- 单词记忆 -->
          <div v-if="settings.mode === 'words'" class="words-display">
            <div class="memory-strategy-tip">
              <div class="strategy-title">💡 记忆策略提示</div>
              <div class="strategy-content">
                {{ getCurrentMemoryStrategy() }}
              </div>
            </div>
            <div class="words-grid">
              <div 
                v-for="(word, index) in currentItems" 
                :key="index"
                class="word-item"
              >
                {{ word }}
              </div>
            </div>
          </div>
          
          <!-- 颜色记忆 -->
          <div v-if="settings.mode === 'colors'" class="colors-display">
            <div class="colors-grid">
              <div 
                v-for="(color, index) in currentItems" 
                :key="index"
                class="color-item"
                :style="{ backgroundColor: color.value }"
              >
                {{ color.name }}
              </div>
            </div>
          </div>
          
          <!-- 形状记忆 -->
          <div v-if="settings.mode === 'shapes'" class="shapes-display">
            <div class="shapes-grid">
              <div 
                v-for="(shape, index) in currentItems" 
                :key="index"
                class="shape-item"
              >
                <div class="shape" :class="shape.type" :style="{ transform: `rotate(${shape.rotation}deg) scale(${shape.size})` }"></div>
              </div>
            </div>
          </div>
          
          <!-- 人脸记忆 -->
          <div v-if="settings.mode === 'faces'" class="faces-display">
            <div class="faces-grid">
              <div 
                v-for="(face, index) in currentItems" 
                :key="index"
                class="face-item"
              >
                <div class="face-features">
                  <div class="feature">{{ face.hair }}</div>
                  <div class="feature">{{ face.eyes }}</div>
                  <div class="feature">{{ face.nose }}</div>
                  <div class="feature">{{ face.mouth }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 扑克牌记忆 -->
          <div v-if="settings.mode === 'cards'" class="cards-display">
            <div class="memory-method-tip">
              <div class="method-title">🃏 记忆方法提示</div>
              <div class="method-content">
                {{ getCurrentCardMemoryMethod() }}
              </div>
            </div>
            <div class="cards-grid">
              <div 
                v-for="(card, index) in currentItems" 
                :key="index"
                class="card-item"
                :style="{ color: card.color }"
              >
                <div class="card-rank">{{ card.rankInfo.display }}</div>
                <div class="card-suit">{{ card.suitInfo.symbol }}</div>
                <div class="card-position">{{ index + 1 }}</div>
              </div>
            </div>
          </div>
          
          <p>请记住这些内容的位置和顺序</p>
        </div>

        <!-- 回忆阶段 -->
        <div v-else-if="phase === 'recall'" class="recall-phase">
          <div class="phase-header">
            <h3>回忆阶段</h3>
            <p>请按照记忆的顺序输入内容</p>
          </div>
          
          <!-- 数字回忆 -->
          <div v-if="settings.mode === 'numbers'" class="numbers-recall">
            <div class="input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="input-item"
              >
                <label>位置 {{ index + 1 }}:</label>
                <input 
                  type="number" 
                  v-model="userAnswers[index]" 
                  @input="checkIfComplete"
                  placeholder="输入数字"
                />
              </div>
            </div>
          </div>
          
          <!-- 图像回忆 -->
          <div v-if="settings.mode === 'images'" class="images-recall">
            <div class="recall-area">
              <div class="slots">
                <div 
                  v-for="(slot, index) in recallSlots" 
                  :key="index"
                  class="slot"
                  :class="{ 
                    selected: selectedSlot === index,
                    filled: slot.filled,
                    correct: slot.correct,
                    incorrect: slot.incorrect
                  }"
                  @click="selectSlot(index)"
                >
                  <div v-if="slot.filled" class="slot-content" :style="{ backgroundColor: slot.color }">
                    {{ slot.symbol }}
                  </div>
                  <div v-else class="slot-placeholder">{{ index + 1 }}</div>
                </div>
              </div>
              
              <div class="available-images">
                <div 
                  v-for="image in shuffledItems" 
                  :key="image.id"
                  class="available-image"
                  :class="{ used: image.used }"
                  :style="{ backgroundColor: image.color }"
                  @click="placeImage(image)"
                >
                  {{ image.symbol }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 单词回忆 -->
          <div v-if="settings.mode === 'words'" class="words-recall">
            <div class="input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="input-item"
              >
                <label>位置 {{ index + 1 }}:</label>
                <input 
                  type="text" 
                  v-model="userAnswers[index]" 
                  @input="checkIfComplete"
                  placeholder="输入单词"
                />
              </div>
            </div>
          </div>
          
          <!-- 颜色回忆 -->
          <div v-if="settings.mode === 'colors'" class="colors-recall">
            <div class="input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="input-item"
              >
                <label>位置 {{ index + 1 }}:</label>
                <select v-model="userAnswers[index]" @change="checkIfComplete">
                  <option value="">选择颜色</option>
                  <option v-for="colorName in trainingData.colors.colorNames" :key="colorName" :value="colorName">
                    {{ colorName }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 形状回忆 -->
          <div v-if="settings.mode === 'shapes'" class="shapes-recall">
            <div class="input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="input-item"
              >
                <label>位置 {{ index + 1 }}:</label>
                <select v-model="userAnswers[index]" @change="checkIfComplete">
                  <option value="">选择形状</option>
                  <option v-for="shapeType in trainingData.shapes.shapeTypes" :key="shapeType" :value="shapeType">
                    {{ shapeType }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 人脸回忆 -->
          <div v-if="settings.mode === 'faces'" class="faces-recall">
            <div class="faces-input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="face-input-item"
              >
                <h4>人脸 {{ index + 1 }}</h4>
                <div class="face-features-input">
                  <select v-model="userAnswers[index].hair" @change="checkIfComplete">
                    <option value="">选择发型</option>
                    <option v-for="hair in trainingData.faces.features.hair" :key="hair" :value="hair">
                      {{ hair }}
                    </option>
                  </select>
                  <select v-model="userAnswers[index].eyes" @change="checkIfComplete">
                    <option value="">选择眼睛</option>
                    <option v-for="eyes in trainingData.faces.features.eyes" :key="eyes" :value="eyes">
                      {{ eyes }}
                    </option>
                  </select>
                  <select v-model="userAnswers[index].nose" @change="checkIfComplete">
                    <option value="">选择鼻子</option>
                    <option v-for="nose in trainingData.faces.features.nose" :key="nose" :value="nose">
                      {{ nose }}
                    </option>
                  </select>
                  <select v-model="userAnswers[index].mouth" @change="checkIfComplete">
                    <option value="">选择嘴巴</option>
                    <option v-for="mouth in trainingData.faces.features.mouth" :key="mouth" :value="mouth">
                      {{ mouth }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 扑克牌回忆 -->
          <div v-if="settings.mode === 'cards'" class="cards-recall">
            <div class="cards-input-grid">
              <div 
                v-for="(answer, index) in userAnswers" 
                :key="index"
                class="card-input-item"
              >
                <label>位置 {{ index + 1 }}:</label>
                <div class="card-input-selects">
                  <select v-model="userAnswers[index].rank" @change="checkIfComplete">
                    <option value="">选择点数</option>
                    <option v-for="(rankInfo, rank) in trainingData.cards.ranks" :key="rank" :value="rank">
                      {{ rankInfo.display }}
                    </option>
                  </select>
                  <select v-model="userAnswers[index].suit" @change="checkIfComplete">
                    <option value="">选择花色</option>
                    <option v-for="(suitInfo, suit) in trainingData.cards.suits" :key="suit" :value="suit">
                      {{ suitInfo.symbol }} {{ suitInfo.name }}
                    </option>
                  </select>
                </div>
                <div v-if="userAnswers[index].rank && userAnswers[index].suit" class="card-preview">
                  <span :style="{ color: trainingData.cards.suits[userAnswers[index].suit]?.color }">
                    {{ trainingData.cards.ranks[userAnswers[index].rank]?.display }}{{ trainingData.cards.suits[userAnswers[index].suit]?.symbol }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="checkAnswers" class="check-btn" :disabled="!allAnswersComplete">检查答案</button>
        </div>

        <div v-else-if="phase === 'result'" class="result-phase">
          <h3>结果</h3>
          <p>正确率: {{ Math.round((correctCount / currentImages.length) * 100) }}%</p>
          <button @click="nextRound" class="next-btn">下一轮</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';

// 训练状态
const isTraining = ref(false);
const phase = ref('memorize');
const countdown = ref(3);
const correctCount = ref(0);

// 训练设置
const settings = reactive({
  mode: 'images',
  difficulty: 'medium',
  memoryTime: 10,
  itemCount: 6,
  displayMode: 'grid',
  backgroundSound: 'none',
  enableHints: false,
  imageTheme: 'geometric',
  wordCategory: 'mixed'
});

// 训练模式配置
const trainingModes = ref([
  {
    id: 'numbers',
    name: '数字记忆',
    description: '记忆随机数字序列，提升数字记忆能力',
    icon: '🔢',
    difficulty: '⭐⭐'
  },
  {
    id: 'images',
    name: '图像记忆',
    description: '记忆图像位置和内容，增强视觉记忆',
    icon: '🖼️',
    difficulty: '⭐⭐⭐'
  },
  {
    id: 'words',
    name: '单词记忆',
    description: '记忆单词列表，提升语言记忆能力',
    icon: '📝',
    difficulty: '⭐⭐⭐⭐'
  },
  {
    id: 'colors',
    name: '颜色记忆',
    description: '记忆颜色序列和组合模式',
    icon: '🎨',
    difficulty: '⭐⭐'
  },
  {
    id: 'shapes',
    name: '形状记忆',
    description: '记忆几何形状的排列组合',
    icon: '🔷',
    difficulty: '⭐⭐⭐'
  },
  {
    id: 'faces',
    name: '人脸记忆',
    description: '记忆人脸特征，提升人脸识别能力',
    icon: '👤',
    difficulty: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'cards',
    name: '扑克牌记忆',
    description: '记忆扑克牌序列，训练专业记忆技巧',
    icon: '🃏',
    difficulty: '⭐⭐⭐⭐⭐'
  }
]);

// 训练统计
const statistics = ref({
  totalSessions: 0,
  averageAccuracy: 0,
  bestScore: 0,
  currentStreak: 0,
  sessionHistory: []
});

// 当前训练数据
const currentItems = ref([]);
const recallSlots = ref([]);
const shuffledItems = ref([]);
const selectedSlot = ref(null);
const userAnswers = ref([]);

// 训练数据配置
const trainingData = {
  numbers: {
    generate: (count) => {
      return Array.from({ length: count }, () => Math.floor(Math.random() * 100))
    }
  },
  images: {
    themes: {
      geometric: {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF8A80', '#81C784'],
        symbols: ['★', '●', '▲', '■', '♦', '♠', '♥', '♣', '◆', '◇', '○', '□', '▼', '►', '◄', '▲']
      },
      nature: {
        colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#795548', '#607D8B', '#9E9E9E'],
        symbols: ['🌸', '🌿', '🍃', '🌺', '🌻', '🌷', '🌹', '🌼', '🍀', '🌱', '🌳', '🌲']
      },
      animals: {
        colors: ['#FF7043', '#8D6E63', '#FFB74D', '#FFF176', '#AED581', '#4DB6AC', '#64B5F6', '#9575CD'],
        symbols: ['🐱', '🐶', '🐰', '🐸', '🐧', '🦋', '🐝', '🐠', '🐢', '🦊', '🐻', '🐼']
      },
      food: {
        colors: ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B', '#8BC34A', '#4CAF50', '#00BCD4', '#9C27B0'],
        symbols: ['🍎', '🍌', '🍇', '🍓', '🍑', '🍊', '🥝', '🍍', '🥕', '🍅', '🌽', '🥒']
      },
      objects: {
        colors: ['#2196F3', '#3F51B5', '#9C27B0', '#E91E63', '#F44336', '#FF5722', '#FF9800', '#FFC107'],
        symbols: ['⚽', '🏀', '🎾', '🎯', '🎨', '🎭', '🎪', '🎸', '📱', '💻', '⌚', '🔑']
      }
    },
    difficulties: {
      beginner: { maxColors: 4, maxSymbols: 4, allowRepeats: true },
      easy: { maxColors: 6, maxSymbols: 6, allowRepeats: true },
      medium: { maxColors: 8, maxSymbols: 8, allowRepeats: false },
      hard: { maxColors: 10, maxSymbols: 10, allowRepeats: false },
      expert: { maxColors: 12, maxSymbols: 12, allowRepeats: false }
    },
    generate: (count, difficulty = 'medium', theme = 'geometric') => {
      const themeData = trainingData.images.themes[theme] || trainingData.images.themes.geometric
      const diffConfig = trainingData.images.difficulties[difficulty] || trainingData.images.difficulties.medium
      
      const availableColors = themeData.colors.slice(0, diffConfig.maxColors)
      const availableSymbols = themeData.symbols.slice(0, diffConfig.maxSymbols)
      
      const usedCombinations = new Set()
      const items = []
      
      for (let i = 0; i < count; i++) {
        let color, symbol, combination
        let attempts = 0
        
        do {
          color = availableColors[Math.floor(Math.random() * availableColors.length)]
          symbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
          combination = `${color}-${symbol}`
          attempts++
        } while (!diffConfig.allowRepeats && usedCombinations.has(combination) && attempts < 50)
        
        if (!diffConfig.allowRepeats) {
          usedCombinations.add(combination)
        }
        
        items.push({
          id: i,
          color,
          symbol,
          position: i,
          theme,
          used: false
        })
      }
      
      return items
    }
  },
  words: {
    categories: {
      fruits: {
        name: '水果类',
        easy: ['苹果', '香蕉', '橙子', '葡萄', '草莓', '桃子', '梨子', '西瓜'],
        medium: ['芒果', '菠萝', '猕猴桃', '火龙果', '榴莲', '山竹', '荔枝', '龙眼'],
        hard: ['释迦', '番石榴', '百香果', '牛油果', '蓝莓', '覆盆子', '黑莓', '醋栗']
      },
      technology: {
        name: '科技类',
        easy: ['电脑', '手机', '电视', '音响', '相机', '键盘', '鼠标', '耳机'],
        medium: ['处理器', '内存条', '硬盘', '显卡', '主板', '电源', '散热器', '机箱'],
        hard: ['量子计算', '人工智能', '区块链', '物联网', '云计算', '大数据', '机器学习', '深度学习']
      },
      animals: {
        name: '动物类',
        easy: ['猫', '狗', '鸟', '鱼', '兔子', '老鼠', '猪', '牛'],
        medium: ['狮子', '老虎', '大象', '长颈鹿', '斑马', '犀牛', '河马', '袋鼠'],
        hard: ['穿山甲', '食蚁兽', '树懒', '鸭嘴兽', '针鼹', '狐猴', '貘', '麝香猫']
      },
      academic: {
        name: '学术类',
        easy: ['数学', '语文', '英语', '科学', '历史', '地理', '音乐', '美术'],
        medium: ['物理学', '化学', '生物学', '心理学', '社会学', '经济学', '政治学', '法学'],
        hard: ['量子力学', '相对论', '热力学', '电磁学', '有机化学', '分子生物学', '神经科学', '认知科学']
      },
      colors: {
        name: '颜色类',
        easy: ['红色', '蓝色', '绿色', '黄色', '黑色', '白色', '紫色', '橙色'],
        medium: ['粉红色', '棕色', '灰色', '青色', '洋红色', '金色', '银色', '米色'],
        hard: ['赭石色', '群青色', '朱砂色', '靛蓝色', '翡翠绿', '琥珀色', '象牙白', '乌木黑']
      }
    },
    strategies: {
      association: '联想记忆法 - 将单词与熟悉的事物联系',
      story: '故事记忆法 - 将单词编成有趣的故事',
      rhyme: '韵律记忆法 - 利用押韵和节奏记忆',
      visual: '视觉记忆法 - 想象单词的视觉形象',
      chunking: '分组记忆法 - 将单词按类别分组记忆'
    },
    generate: (count, difficulty = 'medium', category = 'mixed') => {
      let wordPool = []
      
      if (category === 'mixed') {
        // 混合模式：从所有类别中选择
        Object.values(trainingData.words.categories).forEach(cat => {
          wordPool.push(...(cat[difficulty] || cat.medium))
        })
      } else {
        // 特定类别
        const selectedCategory = trainingData.words.categories[category]
        if (selectedCategory) {
          wordPool = selectedCategory[difficulty] || selectedCategory.medium
        } else {
          // 默认使用科技类
          wordPool = trainingData.words.categories.technology[difficulty] || trainingData.words.categories.technology.medium
        }
      }
      
      // 确保不重复选择单词
      const shuffled = [...wordPool].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, shuffled.length))
    }
  },
  colors: {
    colorNames: ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '粉色', '棕色', '黑色', '白色'],
    colorValues: ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#800080', '#FFA500', '#FFC0CB', '#A52A2A', '#000000', '#FFFFFF'],
    generate: (count) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: trainingData.colors.colorNames[i % trainingData.colors.colorNames.length],
        value: trainingData.colors.colorValues[i % trainingData.colors.colorValues.length]
      }))
    }
  },
  shapes: {
    shapeTypes: ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon'],
    generate: (count) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        type: trainingData.shapes.shapeTypes[Math.floor(Math.random() * trainingData.shapes.shapeTypes.length)],
        size: Math.floor(Math.random() * 3) + 1, // 1-3
        rotation: Math.floor(Math.random() * 360)
      }))
    }
  },
  faces: {
    features: {
      hair: ['短发', '长发', '卷发', '直发', '光头'],
      eyes: ['大眼', '小眼', '圆眼', '细眼'],
      nose: ['高鼻', '塌鼻', '大鼻', '小鼻'],
      mouth: ['大嘴', '小嘴', '厚唇', '薄唇']
    },
    generate: (count) => {
      const features = trainingData.faces.features
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        hair: features.hair[Math.floor(Math.random() * features.hair.length)],
        eyes: features.eyes[Math.floor(Math.random() * features.eyes.length)],
        nose: features.nose[Math.floor(Math.random() * features.nose.length)],
        mouth: features.mouth[Math.floor(Math.random() * features.mouth.length)]
      }))
    }
  },
  
  // 扑克牌记忆训练
  cards: {
    suits: {
      spades: { name: '♠', color: '#000000', symbol: '♠' },
      hearts: { name: '♥', color: '#ff0000', symbol: '♥' },
      diamonds: { name: '♦', color: '#ff0000', symbol: '♦' },
      clubs: { name: '♣', color: '#000000', symbol: '♣' }
    },
    ranks: {
      'A': { name: 'A', value: 1, display: 'A' },
      '2': { name: '2', value: 2, display: '2' },
      '3': { name: '3', value: 3, display: '3' },
      '4': { name: '4', value: 4, display: '4' },
      '5': { name: '5', value: 5, display: '5' },
      '6': { name: '6', value: 6, display: '6' },
      '7': { name: '7', value: 7, display: '7' },
      '8': { name: '8', value: 8, display: '8' },
      '9': { name: '9', value: 9, display: '9' },
      '10': { name: '10', value: 10, display: '10' },
      'J': { name: 'J', value: 11, display: 'J' },
      'Q': { name: 'Q', value: 12, display: 'Q' },
      'K': { name: 'K', value: 13, display: 'K' }
    },
    memoryMethods: {
      person_action_object: {
        name: 'PAO记忆法',
        description: '将每张牌转换为人物-动作-物品的组合进行记忆'
      },
      story_method: {
        name: '故事记忆法',
        description: '将扑克牌序列编成连贯的故事情节'
      },
      location_method: {
        name: '位置记忆法',
        description: '将扑克牌放置在熟悉的地点路线上'
      },
      number_shape: {
        name: '数字形状法',
        description: '将牌面数字转换为形象的图形进行记忆'
      }
    },
    difficulties: {
      beginner: { cardCount: 6, timeMultiplier: 2.5, allowSuits: ['spades', 'hearts'] },
      easy: { cardCount: 10, timeMultiplier: 2.0, allowSuits: ['spades', 'hearts', 'diamonds'] },
      medium: { cardCount: 15, timeMultiplier: 1.5, allowSuits: ['spades', 'hearts', 'diamonds', 'clubs'] },
      hard: { cardCount: 20, timeMultiplier: 1.2, allowSuits: ['spades', 'hearts', 'diamonds', 'clubs'] },
      expert: { cardCount: 26, timeMultiplier: 1.0, allowSuits: ['spades', 'hearts', 'diamonds', 'clubs'] }
    },
    generate: (count, difficulty = 'medium') => {
      const config = trainingData.cards.difficulties[difficulty] || trainingData.cards.difficulties.medium
      const suits = Object.keys(trainingData.cards.suits).filter(suit => 
        config.allowSuits.includes(suit)
      )
      const ranks = Object.keys(trainingData.cards.ranks)
      
      const cards = []
      const usedCards = new Set()
      
      while (cards.length < Math.min(count, config.cardCount)) {
        const suit = suits[Math.floor(Math.random() * suits.length)]
        const rank = ranks[Math.floor(Math.random() * ranks.length)]
        const cardKey = `${rank}_${suit}`
        
        if (!usedCards.has(cardKey)) {
          usedCards.add(cardKey)
          cards.push({
            id: cards.length,
            suit: suit,
            rank: rank,
            suitInfo: trainingData.cards.suits[suit],
            rankInfo: trainingData.cards.ranks[rank],
            display: `${trainingData.cards.ranks[rank].display}${trainingData.cards.suits[suit].symbol}`,
            color: trainingData.cards.suits[suit].color
          })
        }
      }
      
      return cards
    }
  }
}

// 难度配置
const difficultyConfig = {
  beginner: { timeMultiplier: 2.0, hintEnabled: true },
  easy: { timeMultiplier: 1.5, hintEnabled: true },
  medium: { timeMultiplier: 1.0, hintEnabled: false },
  hard: { timeMultiplier: 0.8, hintEnabled: false },
  expert: { timeMultiplier: 0.6, hintEnabled: false }
};

let timer = null;

// 获取当前模式配置
const getCurrentModeConfig = () => {
  return trainingModes.value.find(mode => mode.id === settings.mode) || trainingModes.value[1];
};

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  phase.value = 'memorize';
  generateTrainingItems();
  startCountdown();
  
  // 播放背景音效
  if (settings.backgroundSound !== 'none') {
    playBackgroundSound(settings.backgroundSound);
  }
};

// 生成训练项目
const generateTrainingItems = () => {
  const mode = settings.mode;
  const count = settings.itemCount;
  const difficulty = settings.difficulty;
  
  if (trainingData[mode] && trainingData[mode].generate) {
    if (mode === 'words') {
      currentItems.value = trainingData[mode].generate(count, difficulty, settings.wordCategory);
    } else if (mode === 'images') {
      currentItems.value = trainingData[mode].generate(count, difficulty, settings.imageTheme);
    } else if (mode === 'cards') {
      currentItems.value = trainingData[mode].generate(count, difficulty);
    } else {
      currentItems.value = trainingData[mode].generate(count);
    }
  }
  
  // 初始化回忆槽位和用户答案
  recallSlots.value = Array(count).fill().map(() => ({
    filled: false,
    symbol: '',
    color: '',
    correct: false,
    incorrect: false
  }));
  
  // 根据模式初始化用户答案格式
  if (mode === 'faces') {
    userAnswers.value = Array(count).fill().map(() => ({
      hair: '',
      eyes: '',
      nose: '',
      mouth: ''
    }));
  } else if (mode === 'cards') {
    userAnswers.value = Array(count).fill().map(() => ({
      rank: '',
      suit: ''
    }));
  } else {
    userAnswers.value = Array(count).fill('');
  }
  
  // 为图像模式打乱顺序用于选择
  if (mode === 'images') {
    shuffledItems.value = [...currentItems.value]
      .sort(() => Math.random() - 0.5)
      .map(img => ({ ...img, used: false }));
  }
};

// 播放背景音效
const playBackgroundSound = (soundType) => {
  // 这里可以添加实际的音频播放逻辑
  console.log(`播放背景音效: ${soundType}`);
};

// 开始倒计时
const startCountdown = () => {
  const baseTime = settings.memoryTime;
  const difficultyMultiplier = difficultyConfig[settings.difficulty].timeMultiplier;
  countdown.value = Math.floor(baseTime * difficultyMultiplier);
  
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      showRecallPhase();
    }
  }, 1000);
};

// 显示回忆阶段
const showRecallPhase = () => {
  phase.value = 'recall';
  
  // 根据显示模式处理数据
  if (settings.mode === 'images' && settings.displayMode === 'sequence') {
    shuffledItems.value = [...currentItems.value]
      .sort(() => Math.random() - 0.5)
      .map(item => ({ ...item, used: false }));
  }
};

// 提交答案
const submitAnswer = (slotIndex, answer) => {
  userAnswers.value[slotIndex] = answer;
  
  // 检查是否所有答案都已填写
  if (userAnswers.value.every(answer => answer !== '')) {
    checkAnswers();
  }
};

// 检查答案
const checkAnswers = () => {
  let correct = 0;
  const mode = settings.mode;
  
  for (let i = 0; i < currentItems.value.length; i++) {
    let isCorrect = false;
    
    switch (mode) {
      case 'numbers':
        isCorrect = parseInt(userAnswers.value[i]) === currentItems.value[i];
        break;
      case 'images':
        const currentItem = currentItems.value[i];
        const userAnswer = userAnswers.value[i];
        isCorrect = userAnswer && 
                   userAnswer.color === currentItem.color && 
                   userAnswer.symbol === currentItem.symbol;
        break;
      case 'words':
        isCorrect = userAnswers.value[i].toLowerCase() === currentItems.value[i].toLowerCase();
        break;
      case 'colors':
        isCorrect = userAnswers.value[i] === currentItems.value[i].name;
        break;
      case 'shapes':
        const shapeAnswer = userAnswers.value[i];
        isCorrect = shapeAnswer && shapeAnswer.type === currentItems.value[i].type;
        break;
      case 'faces':
        const faceAnswer = userAnswers.value[i];
        const currentFace = currentItems.value[i];
        isCorrect = faceAnswer && 
                   faceAnswer.hair === currentFace.hair &&
                   faceAnswer.eyes === currentFace.eyes &&
                   faceAnswer.nose === currentFace.nose &&
                   faceAnswer.mouth === currentFace.mouth;
        break;
      case 'cards':
        const cardAnswer = userAnswers.value[i];
        const currentCard = currentItems.value[i];
        isCorrect = cardAnswer && 
                   cardAnswer.rank === currentCard.rank &&
                   cardAnswer.suit === currentCard.suit;
        break;
    }
    
    if (isCorrect) {
      correct++;
      recallSlots.value[i].correct = true;
    } else {
      recallSlots.value[i].incorrect = true;
    }
  }
  
  correctCount.value = correct;
  phase.value = 'result';
  
  // 更新统计数据
  updateStatistics(correct, currentItems.value.length);
};

// 更新统计数据
const updateStatistics = (correct, total) => {
  const accuracy = Math.round((correct / total) * 100);
  
  statistics.value.totalSessions++;
  statistics.value.sessionHistory.push({
    date: new Date(),
    mode: settings.mode,
    difficulty: settings.difficulty,
    accuracy: accuracy,
    correct: correct,
    total: total
  });
  
  // 计算平均准确率
  const totalAccuracy = statistics.value.sessionHistory.reduce((sum, session) => sum + session.accuracy, 0);
  statistics.value.averageAccuracy = Math.round(totalAccuracy / statistics.value.sessionHistory.length);
  
  // 更新最佳成绩
  if (accuracy > statistics.value.bestScore) {
    statistics.value.bestScore = accuracy;
  }
  
  // 更新连续成功次数
  if (accuracy >= 80) {
    statistics.value.currentStreak++;
  } else {
    statistics.value.currentStreak = 0;
  }
  
  // 保存到本地存储
  saveStatistics();
};

// 获取当前记忆策略
const getCurrentMemoryStrategy = () => {
  const category = settings.wordCategory;
  const difficulty = settings.difficulty;
  
  const strategies = {
    mixed: {
      easy: "尝试将单词按照首字母分组，或者找出它们的共同特征",
      medium: "使用联想记忆法，将单词与熟悉的事物联系起来",
      hard: "创建一个包含所有单词的故事情节，按顺序串联记忆"
    },
    fruits: {
      easy: "想象这些水果的颜色、形状和味道",
      medium: "按照水果的季节或产地进行分组记忆",
      hard: "创建一个水果拼盘的视觉画面，记住每个水果的位置"
    },
    technology: {
      easy: "想象这些科技产品的外观和用途",
      medium: "按照科技产品的类别（手机、电脑、软件等）分组",
      hard: "构建一个科技发展的时间线，将单词按历史顺序排列"
    },
    animals: {
      easy: "想象动物的叫声、外形和生活环境",
      medium: "按照动物的栖息地（陆地、海洋、天空）分组记忆",
      hard: "创建一个动物园的参观路线，按顺序记住每个动物"
    },
    academic: {
      easy: "将学术词汇与相关的学科领域联系起来",
      medium: "使用词根词缀分析法，理解单词的构成",
      hard: "构建知识网络，将相关概念连接成思维导图"
    },
    colors: {
      easy: "想象每种颜色对应的具体物品",
      medium: "按照颜色的冷暖色调或彩虹顺序排列",
      hard: "创建一幅彩色画面，将所有颜色融入其中"
    }
  };
  
  return strategies[category]?.[difficulty] || "专注观察，寻找规律，建立联系";
};

// 获取当前扑克牌记忆方法
const getCurrentCardMemoryMethod = () => {
  const difficulty = settings.difficulty;
  const cardCount = currentItems.value.length;
  
  const methods = {
    beginner: "观察每张牌的花色和点数，尝试找出相邻牌之间的关系",
    easy: "使用数字形状法：将点数转换为具体的形象，如A=苹果，2=鸭子",
    medium: "采用故事记忆法：将扑克牌序列编成一个有趣的故事情节",
    hard: "运用位置记忆法：将每张牌放置在熟悉的地点路线上",
    expert: "使用PAO记忆法：将每张牌转换为人物-动作-物品的组合"
  };
  
  if (cardCount <= 8) {
    return methods.beginner || "专注观察每张牌的特征，建立视觉联系";
  } else if (cardCount <= 12) {
    return methods.easy || "使用简单的联想方法记忆";
  } else {
    return methods[difficulty] || "运用专业记忆技巧，建立系统化记忆";
  }
};

// 保存统计数据
const saveStatistics = () => {
  localStorage.setItem('memoryTrainingStats', JSON.stringify(statistics.value));
};

// 加载统计数据
const loadStatistics = () => {
  const saved = localStorage.getItem('memoryTrainingStats');
  if (saved) {
    statistics.value = { ...statistics.value, ...JSON.parse(saved) };
  }
};

// 选择槽位
const selectSlot = (index) => {
  if (recallSlots.value[index].filled) return;
  selectedSlot.value = index;
};

// 放置图像
const placeImage = (image) => {
  if (image.used || selectedSlot.value === null) return;
  
  recallSlots.value[selectedSlot.value] = {
    filled: true,
    symbol: image.symbol,
    color: image.color,
    correct: false,
    incorrect: false
  };
  
  image.used = true;
  selectedSlot.value = null;
};

// 检查是否完成输入
const checkIfComplete = () => {
  // 这个方法会在输入时自动调用，用于实时检查
};

// 检查所有答案是否完成
const allAnswersComplete = computed(() => {
  if (settings.mode === 'faces') {
    return userAnswers.value.every(answer => 
      answer && answer.hair && answer.eyes && answer.nose && answer.mouth
    );
  }
  if (settings.mode === 'cards') {
    return userAnswers.value.every(answer => 
      answer && answer.rank && answer.suit
    );
  }
  return userAnswers.value.every(answer => answer !== '' && answer != null);
});

// 初始化人脸答案结构
const initializeFaceAnswers = () => {
  if (settings.mode === 'faces') {
    userAnswers.value = Array(settings.itemCount).fill(null).map(() => ({
      hair: '',
      eyes: '',
      nose: '',
      mouth: ''
    }));
  }
};

// 选择扑克牌点数
const selectCardRank = (index, rank) => {
  if (!userAnswers.value[index]) {
    userAnswers.value[index] = { rank: '', suit: '' };
  }
  userAnswers.value[index].rank = rank;
};

// 选择扑克牌花色
const selectCardSuit = (index, suit) => {
  if (!userAnswers.value[index]) {
    userAnswers.value[index] = { rank: '', suit: '' };
  }
  userAnswers.value[index].suit = suit;
};

// 获取扑克牌显示文本
const getCardDisplay = (card) => {
  if (!card || !card.rank || !card.suit) return '选择牌';
  const suitSymbols = {
    'spades': '♠',
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣'
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
};

// 检查答案
const checkAnswer = () => {
  correctCount.value = 0;
  
  recallSlots.value.forEach((slot, index) => {
    if (slot.filled) {
      const correct = currentImages.value[index];
      if (slot.symbol === correct.symbol && slot.color === correct.color) {
        slot.correct = true;
        correctCount.value++;
      } else {
        slot.incorrect = true;
      }
    }
  });
  
  phase.value = 'result';
};

// 下一轮
const nextRound = () => {
  isTraining.value = false;
};

// 重新开始
const restart = () => {
  isTraining.value = false;
  phase.value = 'memorize';
  correctCount.value = 0;
  currentItems.value = [];
  recallSlots.value = [];
  shuffledItems.value = [];
  selectedSlot.value = null;
  userAnswers.value = [];
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 监听模式变化，初始化相应的答案结构
watch(() => settings.mode, (newMode) => {
  if (newMode === 'faces') {
    initializeFaceAnswers();
  }
});

onMounted(() => {
  // 加载统计数据
  loadStatistics();
  // 初始化人脸答案结构
  if (settings.mode === 'faces') {
    initializeFaceAnswers();
  }
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.memory-training {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.training-header {
  text-align: center;
  margin-bottom: 30px;
}

.training-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.training-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 模式选择 */
.mode-selection {
  margin-bottom: 30px;
}

.mode-selection h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.mode-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.mode-card.active {
  border-color: #3498db;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.mode-card h4 {
  margin: 10px 0;
  font-size: 1.2rem;
}

.mode-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 10px;
}

.mode-difficulty {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 设置区域 */
.settings {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-item label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.setting-item select,
.setting-item input {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.setting-item select:focus,
.setting-item input:focus {
  outline: none;
  border-color: #3498db;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

/* 统计区域 */
.training-stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.training-stats h3 {
  text-align: center;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 开始按钮 */
.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* 训练阶段 */
.phase-header {
  text-align: center;
  margin-bottom: 30px;
}

.phase-header h3 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.countdown {
  font-size: 3rem;
  font-weight: bold;
  color: #e74c3c;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

/* 显示网格 */
.numbers-grid,
.images-grid,
.words-grid,
.colors-grid,
.shapes-grid,
.faces-grid {
  display: grid;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.numbers-grid {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
}

.images-grid {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.images-grid.sequence {
  grid-template-columns: repeat(8, 1fr);
}

.words-grid {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.colors-grid {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.shapes-grid {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.faces-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

/* 项目样式 */
.number-item,
.image-item,
.word-item,
.color-item,
.shape-item,
.face-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.number-item {
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 1.5rem;
}

.image-item {
  height: 100px;
  font-size: 2rem;
}

.word-item {
  height: 80px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  font-size: 1.2rem;
}

.color-item {
  height: 80px;
  font-size: 1rem;
  border: 3px solid white;
}

.shape-item {
  height: 100px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.face-item {
  height: 120px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  flex-direction: column;
  padding: 10px;
}

.face-features {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.feature {
  font-size: 0.9rem;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 12px;
}

/* 形状样式 */
.shape {
  width: 40px;
  height: 40px;
  background: white;
}

.shape.circle {
  border-radius: 50%;
}

.shape.square {
  border-radius: 4px;
}

.shape.triangle {
  width: 0;
  height: 0;
  background: transparent;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid white;
}

.shape.diamond {
  transform: rotate(45deg);
  border-radius: 4px;
}

.shape.star {
  position: relative;
  background: white;
  width: 40px;
  height: 40px;
  transform: rotate(35deg);
}

.shape.star:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  background: white;
  width: 40px;
  height: 40px;
  transform: rotate(-70deg);
}

.shape.hexagon {
  width: 40px;
  height: 23px;
  background: white;
  position: relative;
}

.shape.hexagon:before,
.shape.hexagon:after {
  content: "";
  position: absolute;
  width: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}

.shape.hexagon:before {
  bottom: 100%;
  border-bottom: 12px solid white;
}

.shape.hexagon:after {
  top: 100%;
  border-top: 12px solid white;
}

/* 输入网格 */
.input-grid,
.faces-input-grid {
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.faces-input-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.input-item,
.face-input-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.input-item label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.input-item input,
.input-item select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-item input:focus,
.input-item select:focus {
  outline: none;
  border-color: #3498db;
}

.face-input-item h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.face-features-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.face-features-input select {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 13px;
}

/* 图像回忆特殊样式 */
.recall-area {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 15px;
  max-width: 600px;
}

.slot {
  width: 80px;
  height: 80px;
  border: 3px dashed #bdc3c7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.slot:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.slot.selected {
  border-color: #3498db;
  background: #e3f2fd;
}

/* 扑克牌记忆样式 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-item {
  width: 120px;
  height: 160px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.card-item.spades,
.card-item.clubs {
  color: #2c3e50;
}

.card-item.hearts,
.card-item.diamonds {
  color: #e74c3c;
}

.card-recall-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.card-selector {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.card-selector h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.card-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.suit-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.card-option {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: bold;
}

.card-option:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.card-option.selected {
  border-color: #3498db;
  background: #3498db;
  color: white;
}

.card-option.suit.spades,
.card-option.suit.clubs {
  color: #2c3e50;
}

.card-option.suit.hearts,
.card-option.suit.diamonds {
  color: #e74c3c;
}

.card-option.suit.selected {
  color: white;
}

.card-preview {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.memory-method-tip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.memory-method-tip h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.memory-method-tip p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.slot.filled {
  border: 3px solid #27ae60;
  background: #e8f5e8;
}

.slot.correct {
  border-color: #27ae60;
  background: #d5f4e6;
  animation: correctPulse 0.6s ease;
}

.slot.incorrect {
  border-color: #e74c3c;
  background: #fadbd8;
  animation: incorrectShake 0.6s ease;
}

.slot-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.slot-placeholder {
  font-size: 1.2rem;
  color: #7f8c8d;
  font-weight: 600;
}

.available-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 600px;
}

.available-image {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.available-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.available-image.used {
  opacity: 0.3;
  cursor: not-allowed;
  transform: scale(0.9);
}

/* 按钮样式 */
.check-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px auto;
  display: block;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
}

.check-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.6);
}

.check-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.next-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  margin: 20px auto;
  display: block;
}

/* 记忆策略提示 */
.memory-strategy-tip {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
  animation: fadeInUp 0.6s ease-out;
}

.strategy-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-content {
  font-size: 0.95rem;
  line-height: 1.4;
  opacity: 0.95;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 结果阶段 */
.result-phase {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin: 20px 0;
}

.result-phase h3 {
  margin-bottom: 20px;
  font-size: 2rem;
}

/* 动画 */
@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .memory-training {
    padding: 15px;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .numbers-grid,
  .images-grid,
  .words-grid,
  .colors-grid,
  .shapes-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
  
  .faces-grid {
    grid-template-columns: 1fr;
  }
  
  .input-grid {
    grid-template-columns: 1fr;
  }
  
  .faces-input-grid {
    grid-template-columns: 1fr;
  }
  
  .face-features-input {
    grid-template-columns: 1fr;
  }
  
  .countdown {
    font-size: 2.5rem;
  }
}
</style>