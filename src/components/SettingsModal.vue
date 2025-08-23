<template>
  <div class="settings-modal-overlay" v-if="visible" @click="handleOverlayClick">
    <div class="settings-modal" @click.stop>
      <!-- 弹窗头部 -->
      <div class="modal-header">
        <h3 class="modal-title">
          <span class="title-icon">{{ titleIcon }}</span>
          {{ title }}
        </h3>
        <button class="close-btn" @click="closeModal">
          <span class="close-icon">×</span>
        </button>
      </div>

      <!-- 弹窗内容 -->
      <div class="modal-content">
        <div class="settings-sections">
          <div 
            v-for="section in sections" 
            :key="section.id"
            class="settings-section"
          >
            <h4 class="section-title" v-if="section.title">
              <span class="section-icon" v-if="section.icon">{{ section.icon }}</span>
              {{ section.title }}
            </h4>
            
            <div class="section-content">
              <div 
                v-for="setting in section.settings" 
                :key="setting.key"
                class="setting-item"
                :class="{ 'setting-disabled': setting.disabled }"
              >
                <div class="setting-label">
                  <label :for="setting.key">{{ setting.label }}</label>
                  <span class="setting-description" v-if="setting.description">
                    {{ setting.description }}
                  </span>
                </div>
                
                <div class="setting-control">
                  <!-- 滑块控件 -->
                  <div v-if="setting.type === 'range'" class="range-control">
                    <input 
                      :id="setting.key"
                      type="range" 
                      :min="setting.min" 
                      :max="setting.max" 
                      :step="setting.step || 1"
                      :value="modelValue[setting.key]"
                      @input="updateSetting(setting.key, $event.target.value)"
                      :disabled="setting.disabled"
                      class="range-input"
                    >
                    <span class="range-value">
                      {{ formatValue(setting, modelValue[setting.key]) }}
                    </span>
                  </div>
                  
                  <!-- 选择器控件 -->
                  <select 
                    v-else-if="setting.type === 'select'"
                    :id="setting.key"
                    :value="modelValue[setting.key]"
                    @change="updateSetting(setting.key, $event.target.value)"
                    :disabled="setting.disabled"
                    class="select-input"
                  >
                    <option 
                      v-for="option in setting.options" 
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  
                  <!-- 开关控件 -->
                  <label 
                    v-else-if="setting.type === 'switch'"
                    class="switch-control"
                  >
                    <input 
                      :id="setting.key"
                      type="checkbox" 
                      :checked="modelValue[setting.key]"
                      @change="updateSetting(setting.key, $event.target.checked)"
                      :disabled="setting.disabled"
                      class="switch-input"
                    >
                    <span class="switch-slider"></span>
                  </label>
                  
                  <!-- 数字输入控件 -->
                  <input 
                    v-else-if="setting.type === 'number'"
                    :id="setting.key"
                    type="number" 
                    :min="setting.min" 
                    :max="setting.max" 
                    :step="setting.step || 1"
                    :value="modelValue[setting.key]"
                    @input="updateSetting(setting.key, $event.target.value)"
                    :disabled="setting.disabled"
                    class="number-input"
                  >
                  
                  <!-- 文本输入控件 -->
                  <input 
                    v-else-if="setting.type === 'text'"
                    :id="setting.key"
                    type="text" 
                    :value="modelValue[setting.key]"
                    @input="updateSetting(setting.key, $event.target.value)"
                    :disabled="setting.disabled"
                    :placeholder="setting.placeholder"
                    class="text-input"
                  >
                  
                  <!-- 颜色选择控件 -->
                  <div v-else-if="setting.type === 'color'" class="color-control">
                    <input 
                      :id="setting.key"
                      type="color" 
                      :value="modelValue[setting.key]"
                      @input="updateSetting(setting.key, $event.target.value)"
                      :disabled="setting.disabled"
                      class="color-input"
                    >
                    <span class="color-value">{{ modelValue[setting.key] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="resetToDefaults">
          <span class="btn-icon">🔄</span>
          恢复默认
        </button>
        <div class="footer-actions">
          <button class="btn btn-outline" @click="closeModal">
            取消
          </button>
          <button class="btn btn-primary" @click="saveSettings">
            <span class="btn-icon">💾</span>
            保存设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '设置'
    },
    titleIcon: {
      type: String,
      default: '⚙️'
    },
    sections: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Object,
      required: true
    },
    defaultValues: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'close', 'save', 'reset'],
  methods: {
    updateSetting(key, value) {
      const updatedSettings = { ...this.modelValue }
      
      // 类型转换
      if (typeof this.defaultValues[key] === 'number') {
        value = Number(value)
      } else if (typeof this.defaultValues[key] === 'boolean') {
        value = Boolean(value)
      }
      
      updatedSettings[key] = value
      this.$emit('update:modelValue', updatedSettings)
    },
    
    formatValue(setting, value) {
      if (setting.unit) {
        return `${value}${setting.unit}`
      }
      if (setting.formatter) {
        return setting.formatter(value)
      }
      return value
    },
    
    closeModal() {
      this.$emit('close')
    },
    
    saveSettings() {
      this.$emit('save', this.modelValue)
      this.closeModal()
    },
    
    resetToDefaults() {
      this.$emit('reset')
      this.$emit('update:modelValue', { ...this.defaultValues })
    },
    
    handleOverlayClick() {
      this.closeModal()
    }
  }
}
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 1.6rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.close-icon {
  line-height: 1;
}

/* 弹窗内容 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.settings-sections {
  padding: 20px 30px;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 1.2rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.setting-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.setting-label {
  flex: 1;
  min-width: 0;
}

.setting-label label {
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4px;
  cursor: pointer;
}

.setting-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.setting-control {
  flex-shrink: 0;
  min-width: 120px;
}

/* 控件样式 */
.range-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
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

.range-value {
  min-width: 60px;
  text-align: center;
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.select-input {
  width: 100%;
  padding: 8px 12px;
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

.switch-control {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch-input:checked + .switch-slider {
  background-color: #667eea;
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(26px);
}

.number-input,
.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.number-input:focus,
.text-input:focus {
  outline: none;
  border-color: #667eea;
}

.color-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-value {
  font-size: 0.85rem;
  color: #666;
  font-family: monospace;
}

/* 弹窗底部 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-icon {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-modal {
    width: 95vw;
    max-height: 90vh;
  }
  
  .modal-header,
  .settings-sections,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .setting-control {
    min-width: auto;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.2rem;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>