<template>
  <div class="schulte-container training-container">
    <h1 class="training-title">舒尔特表训练</h1>
    
    <div class="training-controls">
      <div class="form-group">
        <label class="form-label">表格大小</label>
        <select v-model="tableSize" class="form-control" :disabled="isTraining">
          <option value="3">3 x 3</option>
          <option value="4">4 x 4</option>
          <option value="5">5 x 5</option>
          <option value="6">6 x 6</option>
          <option value="7">7 x 7</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">内容类型</label>
        <select v-model="contentType" class="form-control" :disabled="isTraining">
          <option value="numbers">数字</option>
          <option value="letters">字母</option>
          <option value="mixed">混合</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">颜色模式</label>
        <select v-model="colorMode" class="form-control" :disabled="isTraining">
          <option value="normal">普通</option>
          <option value="colored">彩色</option>
          <option value="colorWord">颜色词</option>
        </select>
      </div>
    </div>
    
    <div class="training-stats" v-if="isTraining || hasCompleted">
      <div class="stat-item">
        <div class="stat-value">{{ formatTime(elapsedTime) }}</div>
        <div class="stat-label">用时</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ currentIndex }} / {{ totalItems }}</div>
        <div class="stat-label">进度</div>
      </div>
      <div class="stat-item" v-if="hasCompleted">
        <div class="stat-value">{{ formatTime(completionTime) }}</div>
        <div class="stat-label">完成时间</div>
      </div>
    </div>
    
    <div class="schulte-actions">
      <button 
        v-if="!isTraining" 
        @click="startTraining" 
        class="btn btn-primary btn-lg"
      >
        开始训练
      </button>
      <button 
        v-else-if="!hasCompleted" 
        @click="stopTraining" 
        class="btn btn-danger btn-lg"
      >
        停止训练
      </button>
      <button 
        v-else 
        @click="resetTraining" 
        class="btn btn-primary btn-lg"
      >
        再次训练
      </button>
    </div>
    
    <div class="schulte-table-wrapper" v-if="isTraining && !hasCompleted">
      <div 
        class="schulte-table" 
        :style="{ 
          'grid-template-columns': `repeat(${tableSize}, 1fr)`,
          'grid-template-rows': `repeat(${tableSize}, 1fr)`
        }"
      >
        <div 
          v-for="(item, index) in tableItems" 
          :key="index"
          class="schulte-cell"
          :class="{
            'colored-text': colorMode === 'colored',
            'color-word': colorMode === 'colorWord',
            'highlight': highlightNext && index === nextItemIndex
          }"
          :style="getCellStyle(item)"
          @click="handleCellClick(item, index)"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
    
    <div class="training-message" v-if="hasCompleted">
      <div class="message-card">
        <h3>训练完成！</h3>
        <p>您已成功完成本次舒尔特表训练。</p>
        <p>完成时间: {{ formatTime(completionTime) }}</p>
        <p>表格大小: {{ tableSize }} x {{ tableSize }}</p>
        <p>内容类型: {{ getContentTypeName() }}</p>
      </div>
    </div>
    
    <div class="training-instructions" v-if="!isTraining">
      <div class="card">
        <h3 class="card-title">训练说明</h3>
        <div class="card-content">
          <p>舒尔特表训练是一种提高注意力和视觉扫描能力的经典训练方法。</p>
          <p>训练目标：按照顺序（从小到大或按字母顺序）尽快找出所有数字或字母。</p>
          <p>训练方法：</p>
          <ol>
            <li>保持视线固定在表格中央</li>
            <li>利用周边视觉寻找目标数字或字母</li>
            <li>尽量减少眼球移动，扩大视野范围</li>
            <li>按照顺序点击，错误选择会有提示</li>
          </ol>
          <p>建议：每天训练3-5次，每次不超过10分钟，持续训练可以显著提高注意力和视觉扫描能力。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// 训练配置
const tableSize = ref(5); // 默认5x5
const contentType = ref('numbers'); // 默认数字
const colorMode = ref('normal'); // 默认普通模式
const highlightNext = ref(false); // 是否高亮下一个目标

// 训练状态
const isTraining = ref(false);
const hasCompleted = ref(false);
const elapsedTime = ref(0);
const completionTime = ref(0);
const currentIndex = ref(0);
const tableItems = ref([]);
const nextItemIndex = ref(-1);

// 计时器
let timer = null;

// 计算总项目数
const totalItems = computed(() => {
  return tableSize.value * tableSize.value;
});

// 获取内容类型名称
const getContentTypeName = () => {
  const types = {
    'numbers': '数字',
    'letters': '字母',
    'mixed': '混合'
  };
  return types[contentType.value] || '数字';
};

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 生成表格内容
const generateTableItems = () => {
  let items = [];
  const size = parseInt(tableSize.value);
  const total = size * size;
  
  // 根据内容类型生成项目
  if (contentType.value === 'numbers') {
    // 数字模式：1到total
    for (let i = 1; i <= total; i++) {
      items.push({
        value: i,
        index: i - 1,
        color: getRandomColor()
      });
    }
  } else if (contentType.value === 'letters') {
    // 字母模式：A到对应字母
    for (let i = 0; i < total; i++) {
      const charCode = 'A'.charCodeAt(0) + i;
      if (charCode <= 'Z'.charCodeAt(0)) {
        items.push({
          value: String.fromCharCode(charCode),
          index: i,
          color: getRandomColor()
        });
      } else {
        // 如果超出字母范围，使用数字补充
        items.push({
          value: i - 25, // 从1开始
          index: i,
          color: getRandomColor()
        });
      }
    }
  } else if (contentType.value === 'mixed') {
    // 混合模式：数字和字母混合
    for (let i = 0; i < total; i++) {
      if (i % 2 === 0) {
        items.push({
          value: Math.floor(i / 2) + 1,
          index: i,
          color: getRandomColor()
        });
      } else {
        const charIndex = Math.floor(i / 2);
        const charCode = 'A'.charCodeAt(0) + charIndex;
        if (charCode <= 'Z'.charCodeAt(0)) {
          items.push({
            value: String.fromCharCode(charCode),
            index: i,
            color: getRandomColor()
          });
        } else {
          items.push({
            value: charIndex - 25 + 1,
            index: i,
            color: getRandomColor()
          });
        }
      }
    }
  }
  
  // 随机打乱顺序
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  
  return items;
};

// 获取随机颜色
const getRandomColor = () => {
  const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 获取单元格样式
const getCellStyle = (item) => {
  if (colorMode.value === 'normal') {
    return {};
  } else if (colorMode.value === 'colored') {
    return { color: item.color };
  } else if (colorMode.value === 'colorWord') {
    // 颜色词模式：文字颜色和实际颜色不一致
    const otherColors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4']
      .filter(color => color !== item.color);
    const randomColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    return { color: randomColor };
  }
  return {};
};

// 开始训练
const startTraining = () => {
  isTraining.value = true;
  hasCompleted.value = false;
  elapsedTime.value = 0;
  currentIndex.value = 0;
  tableItems.value = generateTableItems();
  updateNextItemIndex();
  
  // 启动计时器
  timer = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

// 停止训练
const stopTraining = () => {
  isTraining.value = false;
  clearInterval(timer);
  timer = null;
};

// 重置训练
const resetTraining = () => {
  isTraining.value = false;
  hasCompleted.value = false;
  elapsedTime.value = 0;
  completionTime.value = 0;
  currentIndex.value = 0;
  tableItems.value = [];
  nextItemIndex.value = -1;
};

// 更新下一个目标项的索引
const updateNextItemIndex = () => {
  if (currentIndex.value >= totalItems.value) {
    nextItemIndex.value = -1;
    return;
  }
  
  // 查找下一个目标项在表格中的位置
  for (let i = 0; i < tableItems.value.length; i++) {
    if (contentType.value === 'numbers') {
      if (tableItems.value[i].value === currentIndex.value + 1) {
        nextItemIndex.value = i;
        break;
      }
    } else if (contentType.value === 'letters') {
      const targetChar = String.fromCharCode('A'.charCodeAt(0) + currentIndex.value);
      if (tableItems.value[i].value === targetChar) {
        nextItemIndex.value = i;
        break;
      }
    } else if (contentType.value === 'mixed') {
      // 混合模式的逻辑较复杂，需要根据当前索引确定目标是数字还是字母
      if (currentIndex.value % 2 === 0) {
        // 偶数索引对应数字
        const targetNum = Math.floor(currentIndex.value / 2) + 1;
        if (tableItems.value[i].value === targetNum) {
          nextItemIndex.value = i;
          break;
        }
      } else {
        // 奇数索引对应字母
        const charIndex = Math.floor(currentIndex.value / 2);
        const targetChar = String.fromCharCode('A'.charCodeAt(0) + charIndex);
        if (tableItems.value[i].value === targetChar) {
          nextItemIndex.value = i;
          break;
        }
      }
    }
  }
};

// 处理单元格点击
const handleCellClick = (item, index) => {
  if (!isTraining.value || hasCompleted.value) return;
  
  let isCorrect = false;
  
  if (contentType.value === 'numbers') {
    // 数字模式：检查是否点击了正确的下一个数字
    isCorrect = item.value === currentIndex.value + 1;
  } else if (contentType.value === 'letters') {
    // 字母模式：检查是否点击了正确的下一个字母
    const targetChar = String.fromCharCode('A'.charCodeAt(0) + currentIndex.value);
    isCorrect = item.value === targetChar;
  } else if (contentType.value === 'mixed') {
    // 混合模式：根据当前索引确定目标是数字还是字母
    if (currentIndex.value % 2 === 0) {
      // 偶数索引对应数字
      const targetNum = Math.floor(currentIndex.value / 2) + 1;
      isCorrect = item.value === targetNum;
    } else {
      // 奇数索引对应字母
      const charIndex = Math.floor(currentIndex.value / 2);
      const targetChar = String.fromCharCode('A'.charCodeAt(0) + charIndex);
      isCorrect = item.value === targetChar;
    }
  }
  
  if (isCorrect) {
    // 正确选择
    currentIndex.value++;
    
    // 检查是否完成训练
    if (currentIndex.value >= totalItems.value) {
      completeTraining();
    } else {
      updateNextItemIndex();
    }
  } else {
    // 错误选择，可以添加一些视觉反馈
    // 例如闪烁效果或声音提示
  }
};

// 完成训练
const completeTraining = () => {
  hasCompleted.value = true;
  completionTime.value = elapsedTime.value;
  clearInterval(timer);
  timer = null;
  
  // 保存训练结果到本地存储
  // 这部分将在实现本地存储功能时完成
};

// 组件卸载前清理计时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.schulte-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schulte-actions {
  margin-bottom: 2rem;
}

.schulte-table-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.schulte-table {
  display: grid;
  gap: 8px;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.schulte-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: calc(16px + 1vw);
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.schulte-cell:hover {
  background-color: #e9ecef;
  transform: scale(1.05);
}

.schulte-cell:active {
  transform: scale(0.95);
}

.colored-text {
  /* 样式在getCellStyle中动态设置 */
}

.color-word {
  /* 样式在getCellStyle中动态设置 */
}

.highlight {
  background-color: rgba(74, 111, 165, 0.2);
}

.training-message {
  margin-top: 2rem;
  text-align: center;
}

.message-card {
  background-color: #e8f4f8;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.training-instructions {
  margin-top: 2rem;
  width: 100%;
  max-width: 800px;
}

@media (max-width: 768px) {
  .training-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .schulte-table-wrapper {
    max-width: 100%;
  }
  
  .schulte-cell {
    font-size: calc(14px + 1vw);
  }
}
</style>