<template>
  <div class="breadcrumb-nav">
    <!-- 主模块 -->
    <div class="breadcrumb-dropdown" @mouseenter="showDropdown" @mouseleave="hideDropdown">
      <span class="breadcrumb-item" @click="navigateToParent">
        {{ mainTitle }}
      </span>
      <transition name="dropdown">
        <div v-if="isVisible" class="dropdown-menu">
          <div 
            v-for="item in siblingModules" 
            :key="item.path"
            class="dropdown-item"
            :class="{ active: item.path === $route.path }"
            @click="navigateToItem(item.path)"
          >
            {{ item.title }}
          </div>
        </div>
      </transition>
    </div>
    
    <!-- 子模块（如果存在） -->
    <template v-if="subTitle">
      <span class="breadcrumb-separator">/</span>
      <div class="breadcrumb-dropdown" @mouseenter="showSubDropdown" @mouseleave="hideSubDropdown">
        <span class="breadcrumb-item" @click="navigateToSub">
          {{ subTitle }}
        </span>
        <transition name="dropdown">
          <div v-if="isSubVisible" class="dropdown-menu">
            <div 
              v-for="item in subSiblingModules" 
              :key="item.path"
              class="dropdown-item"
              :class="{ active: item.path === $route.path }"
              @click="navigateToItem(item.path)"
            >
              {{ item.title }}
            </div>
          </div>
        </transition>
      </div>
    </template>
    
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-current">{{ currentTitle }}</span>
  </div>
</template>

<script>
export default {
  name: 'BreadcrumbDropdown',
  props: {
    mainTitle: {
      type: String,
      required: true
    },
    mainPath: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      default: ''
    },
    subPath: {
      type: String,
      default: ''
    },
    currentTitle: {
      type: String,
      required: true
    },
    siblingModules: {
      type: Array,
      required: true
    },
    subSiblingModules: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isVisible: false,
      hoverTimer: null,
      isSubVisible: false,
      subHoverTimer: null
    }
  },
  methods: {
    showDropdown() {
      // 延迟显示下拉菜单
      this.hoverTimer = setTimeout(() => {
        this.isVisible = true
      }, 300) // 300ms延迟
    },
    hideDropdown() {
      // 清除定时器并隐藏下拉菜单
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer)
        this.hoverTimer = null
      }
      this.isVisible = false
    },
    navigateToParent() {
      this.$router.push(this.mainPath)
    },
    navigateToSub() {
      if (this.subPath) {
        this.$router.push(this.subPath)
      }
    },
    navigateToItem(path) {
      this.$router.push(path)
      this.isVisible = false
      this.isSubVisible = false
    },
    showSubDropdown() {
      // 延迟显示子模块下拉菜单
      this.subHoverTimer = setTimeout(() => {
        this.isSubVisible = true
      }, 300) // 300ms延迟
    },
    hideSubDropdown() {
      // 清除定时器并隐藏子模块下拉菜单
      if (this.subHoverTimer) {
        clearTimeout(this.subHoverTimer)
        this.subHoverTimer = null
      }
      this.isSubVisible = false
    }
  },
  beforeUnmount() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer)
    }
    if (this.subHoverTimer) {
      clearTimeout(this.subHoverTimer)
    }
  }
}
</script>

<style scoped>
/* 面包屑导航样式 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.breadcrumb-dropdown {
  position: relative;
  display: inline-block;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease;
  border: none;
  background: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.breadcrumb-item:hover {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.breadcrumb-separator {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.breadcrumb-current {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
  position: relative;
  padding: 4px 8px;
  border-radius: 4px;
}

.breadcrumb-current::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
  border-radius: 4px;
  z-index: -1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 8px 0;
  margin-top: 4px;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
  border-left-color: #007bff;
}

.dropdown-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left-color: #1976d2;
  font-weight: 600;
}

.dropdown-item.active:hover {
  background-color: #bbdefb;
}

/* 下拉动画 */
.dropdown-enter-active {
  transition: all 0.2s ease;
}

.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dropdown-menu {
    min-width: 150px;
    font-size: 13px;
  }
  
  .dropdown-item {
    padding: 8px 12px;
  }
}
</style>