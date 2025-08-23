<template>
  <button 
    class="settings-button"
    :class="{
      'button-floating': floating,
      'button-compact': compact,
      'button-primary': variant === 'primary',
      'button-secondary': variant === 'secondary',
      'button-outline': variant === 'outline'
    }"
    @click="handleClick"
    :disabled="disabled"
    :title="tooltip || '设置参数'"
  >
    <span class="button-icon">
      <svg v-if="!customIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
      </svg>
      <span v-else v-html="customIcon"></span>
    </span>
    
    <span class="button-text" v-if="!compact && text">
      {{ text }}
    </span>
    
    <!-- 加载状态 -->
    <span v-if="loading" class="button-loading">
      <svg class="loading-spinner" width="16" height="16" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    </span>
    
    <!-- 通知徽章 -->
    <span v-if="badge" class="button-badge">
      {{ typeof badge === 'number' ? badge : '' }}
    </span>
  </button>
</template>

<script>
export default {
  name: 'SettingsButton',
  props: {
    // 按钮文本
    text: {
      type: String,
      default: '设置'
    },
    // 按钮变体
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
    },
    // 是否浮动显示
    floating: {
      type: Boolean,
      default: false
    },
    // 紧凑模式（只显示图标）
    compact: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 工具提示
    tooltip: String,
    // 自定义图标
    customIcon: String,
    // 通知徽章
    badge: [Number, Boolean],
    // 点击事件处理
    onClick: Function
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (this.disabled || this.loading) return
      
      this.$emit('click', event)
      
      if (this.onClick) {
        this.onClick(event)
      }
    }
  }
}
</script>

<style scoped>
.settings-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  outline: none;
  user-select: none;
  min-height: 40px;
}

/* 按钮变体 */
.button-primary {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.button-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.button-secondary {
  background: #6c757d;
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.button-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.button-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.button-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

/* 浮动按钮 */
.button-floating {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.button-floating:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.button-floating .button-text {
  display: none;
}

/* 紧凑模式 */
.button-compact {
  padding: 8px;
  min-width: 36px;
  min-height: 36px;
}

.button-compact .button-text {
  display: none;
}

/* 禁用状态 */
.settings-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 图标 */
.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.settings-button:hover:not(:disabled) .button-icon {
  transform: rotate(90deg);
}

.button-floating .button-icon {
  font-size: 1.2rem;
}

/* 加载状态 */
.button-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.settings-button.loading .button-icon,
.settings-button.loading .button-text {
  opacity: 0;
}

/* 通知徽章 */
.button-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #dc3545;
  color: white;
  border-radius: 9px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}

.button-floating .button-badge {
  top: -3px;
  right: -3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-floating {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
  }
  
  .settings-button {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .button-compact {
    padding: 6px;
    min-width: 32px;
    min-height: 32px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .button-outline {
    border-color: #8b9dc3;
    color: #8b9dc3;
  }
  
  .button-outline:hover:not(:disabled) {
    background: #8b9dc3;
    color: #1a1a1a;
  }
}

/* 动画效果 */
.settings-button {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 焦点状态 */
.settings-button:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .settings-button {
    border: 2px solid currentColor;
  }
}
</style>