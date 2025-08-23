<template>
  <div class="parameter-control" :class="{ 'control-disabled': disabled }">
    <div class="control-label" v-if="label">
      <label :for="controlId">{{ label }}</label>
      <span class="control-description" v-if="description">
        {{ description }}
      </span>
    </div>
    
    <div class="control-wrapper">
      <!-- 滑块控件 -->
      <div v-if="type === 'range'" class="range-control">
        <input 
          :id="controlId"
          type="range" 
          :min="min" 
          :max="max" 
          :step="step"
          :value="modelValue"
          @input="handleInput"
          :disabled="disabled"
          class="range-input"
        >
        <div class="range-display">
          <span class="range-value">{{ formatValue(modelValue) }}</span>
          <div class="range-marks" v-if="showMarks">
            <span 
              v-for="mark in marks" 
              :key="mark.value"
              class="range-mark"
              :style="{ left: getMarkPosition(mark.value) + '%' }"
            >
              {{ mark.label }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 选择器控件 -->
      <select 
        v-else-if="type === 'select'"
        :id="controlId"
        :value="modelValue"
        @change="handleChange"
        :disabled="disabled"
        class="select-input"
      >
        <option 
          v-for="option in options" 
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- 多选控件 -->
      <div v-else-if="type === 'multiselect'" class="multiselect-control">
        <div class="multiselect-options">
          <label 
            v-for="option in options" 
            :key="option.value"
            class="multiselect-option"
            :class="{ active: isSelected(option.value) }"
          >
            <input 
              type="checkbox" 
              :value="option.value"
              :checked="isSelected(option.value)"
              @change="handleMultiSelect(option.value)"
              :disabled="disabled || option.disabled"
            >
            <span class="option-label">{{ option.label }}</span>
          </label>
        </div>
      </div>
      
      <!-- 开关控件 -->
      <label 
        v-else-if="type === 'switch'"
        class="switch-control"
        :class="{ active: modelValue }"
      >
        <input 
          :id="controlId"
          type="checkbox" 
          :checked="modelValue"
          @change="handleChange"
          :disabled="disabled"
          class="switch-input"
        >
        <span class="switch-slider">
          <span class="switch-handle"></span>
        </span>
        <span class="switch-label" v-if="switchLabels">
          {{ modelValue ? switchLabels.on : switchLabels.off }}
        </span>
      </label>
      
      <!-- 数字输入控件 -->
      <div v-else-if="type === 'number'" class="number-control">
        <button 
          class="number-btn decrease"
          @click="decreaseValue"
          :disabled="disabled || modelValue <= min"
        >
          −
        </button>
        <input 
          :id="controlId"
          type="number" 
          :min="min" 
          :max="max" 
          :step="step"
          :value="modelValue"
          @input="handleInput"
          :disabled="disabled"
          class="number-input"
        >
        <button 
          class="number-btn increase"
          @click="increaseValue"
          :disabled="disabled || modelValue >= max"
        >
          +
        </button>
      </div>
      
      <!-- 文本输入控件 -->
      <input 
        v-else-if="type === 'text'"
        :id="controlId"
        type="text" 
        :value="modelValue"
        @input="handleInput"
        :disabled="disabled"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="text-input"
      >
      
      <!-- 颜色选择控件 -->
      <div v-else-if="type === 'color'" class="color-control">
        <div class="color-preview" :style="{ backgroundColor: modelValue }">
          <input 
            :id="controlId"
            type="color" 
            :value="modelValue"
            @input="handleInput"
            :disabled="disabled"
            class="color-input"
          >
        </div>
        <span class="color-value">{{ modelValue }}</span>
        <div class="color-presets" v-if="colorPresets">
          <button 
            v-for="preset in colorPresets" 
            :key="preset"
            class="color-preset"
            :style="{ backgroundColor: preset }"
            @click="updateValue(preset)"
            :disabled="disabled"
          ></button>
        </div>
      </div>
      
      <!-- 按钮组控件 -->
      <div v-else-if="type === 'buttonGroup'" class="button-group-control">
        <button 
          v-for="option in options" 
          :key="option.value"
          class="group-button"
          :class="{ active: modelValue === option.value }"
          @click="updateValue(option.value)"
          :disabled="disabled || option.disabled"
        >
          <span class="button-icon" v-if="option.icon">{{ option.icon }}</span>
          {{ option.label }}
        </button>
      </div>
      
      <!-- 时间输入控件 -->
      <div v-else-if="type === 'time'" class="time-control">
        <input 
          :id="controlId"
          type="time" 
          :value="modelValue"
          @input="handleInput"
          :disabled="disabled"
          class="time-input"
        >
      </div>
    </div>
    
    <!-- 控件提示 -->
    <div class="control-hint" v-if="hint">
      <span class="hint-icon">💡</span>
      {{ hint }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParameterControl',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => [
        'range', 'select', 'multiselect', 'switch', 'number', 
        'text', 'color', 'buttonGroup', 'time'
      ].includes(value)
    },
    modelValue: {
      required: true
    },
    label: String,
    description: String,
    hint: String,
    disabled: {
      type: Boolean,
      default: false
    },
    // 通用属性
    min: Number,
    max: Number,
    step: {
      type: Number,
      default: 1
    },
    // 选择器属性
    options: Array,
    // 文本输入属性
    placeholder: String,
    maxLength: Number,
    // 滑块属性
    unit: String,
    formatter: Function,
    showMarks: {
      type: Boolean,
      default: false
    },
    marks: Array,
    // 开关属性
    switchLabels: Object, // { on: '开启', off: '关闭' }
    // 颜色属性
    colorPresets: Array
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    controlId() {
      return `control-${this.$.uid}`
    }
  },
  methods: {
    handleInput(event) {
      let value = event.target.value
      
      // 类型转换
      if (this.type === 'number' || this.type === 'range') {
        value = Number(value)
      }
      
      this.updateValue(value)
    },
    
    handleChange(event) {
      let value = event.target.checked !== undefined 
        ? event.target.checked 
        : event.target.value
      
      this.updateValue(value)
    },
    
    handleMultiSelect(optionValue) {
      let newValue = Array.isArray(this.modelValue) ? [...this.modelValue] : []
      
      if (newValue.includes(optionValue)) {
        newValue = newValue.filter(v => v !== optionValue)
      } else {
        newValue.push(optionValue)
      }
      
      this.updateValue(newValue)
    },
    
    isSelected(value) {
      if (Array.isArray(this.modelValue)) {
        return this.modelValue.includes(value)
      }
      return false
    },
    
    updateValue(value) {
      if (this.disabled) return
      
      // 数值范围限制
      if ((this.type === 'number' || this.type === 'range') && typeof value === 'number') {
        if (this.min !== undefined) value = Math.max(this.min, value)
        if (this.max !== undefined) value = Math.min(this.max, value)
      }
      
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    
    increaseValue() {
      const newValue = Number(this.modelValue) + (this.step || 1)
      this.updateValue(newValue)
    },
    
    decreaseValue() {
      const newValue = Number(this.modelValue) - (this.step || 1)
      this.updateValue(newValue)
    },
    
    formatValue(value) {
      if (this.formatter) {
        return this.formatter(value)
      }
      if (this.unit) {
        return `${value}${this.unit}`
      }
      return value
    },
    
    getMarkPosition(value) {
      const range = this.max - this.min
      return ((value - this.min) / range) * 100
    }
  }
}
</script>

<style scoped>
.parameter-control {
  margin-bottom: 20px;
}

.control-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.control-label {
  margin-bottom: 8px;
}

.control-label label {
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4px;
  cursor: pointer;
}

.control-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.control-wrapper {
  position: relative;
}

/* 滑块控件 */
.range-control {
  width: 100%;
}

.range-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 10px;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #5a6fd8;
}

.range-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.range-value {
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.range-marks {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  height: 20px;
}

.range-mark {
  position: absolute;
  font-size: 0.75rem;
  color: #999;
  transform: translateX(-50%);
}

/* 选择器控件 */
.select-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 多选控件 */
.multiselect-control {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.multiselect-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.multiselect-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.multiselect-option.active {
  background: #667eea;
  color: white;
  border-color: #5a6fd8;
}

.multiselect-option input {
  display: none;
}

/* 开关控件 */
.switch-control {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.switch-input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 26px;
  transition: all 0.3s ease;
}

.switch-handle {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-control.active .switch-slider {
  background: #667eea;
}

.switch-control.active .switch-handle {
  transform: translateX(24px);
}

.switch-label {
  font-weight: 500;
  color: #333;
}

/* 数字控件 */
.number-control {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.number-btn {
  width: 35px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-input {
  flex: 1;
  border: none;
  padding: 10px;
  text-align: center;
  font-size: 0.9rem;
  outline: none;
}

/* 文本输入控件 */
.text-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 颜色控件 */
.color-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.color-preview {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  overflow: hidden;
  cursor: pointer;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
  opacity: 0;
}

.color-value {
  font-size: 0.85rem;
  color: #666;
  font-family: monospace;
}

.color-presets {
  display: flex;
  gap: 6px;
}

.color-preset {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-preset:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

/* 按钮组控件 */
.button-group-control {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.group-button {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.group-button:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
}

.group-button.active {
  background: #667eea;
  color: white;
  border-color: #5a6fd8;
}

.group-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1rem;
}

/* 时间控件 */
.time-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.time-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 控件提示 */
.control-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-icon {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-control,
  .button-group-control {
    flex-direction: column;
    align-items: stretch;
  }
  
  .multiselect-options {
    flex-direction: column;
  }
  
  .switch-control {
    justify-content: space-between;
  }
}
</style>