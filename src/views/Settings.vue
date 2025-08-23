<template>
  <div class="settings-container">
    <h1>设置</h1>
    
    <div class="settings-section">
      <h2>应用设置</h2>
      <div class="setting-item">
        <label for="theme">主题</label>
        <select id="theme" v-model="settings.theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>
      
      <div class="setting-item">
        <label for="sound-enabled">声音</label>
        <input type="checkbox" id="sound-enabled" v-model="settings.soundEnabled">
      </div>
      
      <div class="setting-item">
        <label for="notifications-enabled">通知</label>
        <input type="checkbox" id="notifications-enabled" v-model="settings.notificationsEnabled">
      </div>
    </div>
    

    

    

    
    <div class="settings-section">
      <h2>数据管理</h2>
      <div class="setting-item">
        <label for="auto-backup-enabled">启用自动备份</label>
        <input type="checkbox" id="auto-backup-enabled" v-model="settings.dataManagement.autoBackupEnabled">
      </div>
      
      <div class="setting-item" v-if="settings.dataManagement.autoBackupEnabled">
        <label for="backup-interval">备份间隔（天）</label>
        <input type="number" id="backup-interval" v-model.number="settings.dataManagement.backupInterval" min="1" max="30" step="1">
      </div>
      
      <div class="setting-item" v-if="lastBackupInfo">
        <label>上次备份时间</label>
        <div class="info-text">{{ formatBackupDate(lastBackupInfo.date) }}</div>
        <button @click="restoreFromBackup" class="btn secondary small">从备份恢复</button>
      </div>
      
      <div class="data-management-buttons">
        <button @click="exportData" class="btn primary">导出数据</button>
        <button @click="showImportDialog" class="btn secondary">导入数据</button>
        <button @click="createManualBackup" class="btn primary">立即备份</button>
        <button @click="confirmClearData" class="btn danger">清除所有数据</button>
      </div>
      
      <div class="setting-item">
        <label for="keep-settings">清除数据时保留设置</label>
        <input type="checkbox" id="keep-settings" v-model="keepSettings">
      </div>
      
      <input type="file" ref="fileInput" style="display: none" @change="handleFileUpload" accept=".json">
    </div>
    
    <div class="settings-actions">
      <button @click="saveSettings" class="btn primary">保存设置</button>
      <button @click="resetSettings" class="btn secondary">重置为默认</button>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay">
      <div class="confirm-dialog">
        <h3>{{ confirmDialogTitle }}</h3>
        <p>{{ confirmDialogMessage }}</p>
        <div class="confirm-dialog-actions">
          <button @click="confirmDialogAction" class="btn danger">确认</button>
          <button @click="cancelDialog" class="btn secondary">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 通知提示 -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { 
  getUserSettings, 
  saveUserSettings, 
  getDefaultSettings,
  exportAllData,
  importData,
  clearAllData,
  createAutoBackup,
  getLastAutoBackup,
  restoreFromAutoBackup,
  checkAndCreateAutoBackup
} from '../services/storage';

export default {
  name: 'Settings',
  setup() {
    const route = useRoute();
    
    // 设置状态
    const settings = reactive(getDefaultSettings());
    const originalSettings = ref({});
    
    // 如果默认设置中没有数据管理选项，添加它
    if (!settings.dataManagement) {
      settings.dataManagement = {
        autoBackupEnabled: true,
        backupInterval: 1
      };
    }
    
    // 备份相关状态
    const lastBackupInfo = ref(null);
    const keepSettings = ref(true);
    
    // 文件上传引用
    const fileInput = ref(null);
    
    // 确认对话框状态
    const showConfirmDialog = ref(false);
    const confirmDialogTitle = ref('');
    const confirmDialogMessage = ref('');
    const confirmDialogCallback = ref(null);
    const cancelDialogCallback = ref(null);
    
    // 通知状态
    const notification = reactive({
      show: false,
      message: '',
      type: 'info',
      timeout: null
    });
    
    // 加载用户设置
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings();
        Object.assign(settings, userSettings);
        
        // 确保数据管理设置存在
        if (!settings.dataManagement) {
          settings.dataManagement = {
            autoBackupEnabled: true,
            backupInterval: 1
          };
        }
        
        originalSettings.value = JSON.parse(JSON.stringify(settings));
        
        // 获取最后一次备份信息
        loadLastBackupInfo();
        
        // 检查是否需要创建自动备份
        if (settings.dataManagement.autoBackupEnabled) {
          const created = await checkAndCreateAutoBackup(settings.dataManagement.backupInterval);
          if (created) {
            loadLastBackupInfo();
          }
        }
      } catch (error) {
        showNotification('加载设置失败: ' + error.message, 'error');
      }
    };
    
    // 加载最后一次备份信息
    const loadLastBackupInfo = async () => {
      try {
        lastBackupInfo.value = await getLastAutoBackup();
      } catch (error) {
        console.error('加载备份信息失败:', error);
      }
    };
    
    // 保存设置
    const saveSettings = async () => {
      try {
        await saveUserSettings(settings);
        originalSettings.value = JSON.parse(JSON.stringify(settings));
        showNotification('设置已保存', 'success');
        
        // 应用主题
        applyTheme(settings.theme);
      } catch (error) {
        showNotification('保存设置失败: ' + error.message, 'error');
      }
    };
    
    // 重置为默认设置
    const resetSettings = () => {
      showConfirmDialog.value = true;
      confirmDialogTitle.value = '重置设置';
      confirmDialogMessage.value = '确定要将所有设置重置为默认值吗？';
      confirmDialogCallback.value = async () => {
        const defaultSettings = getDefaultSettings();
        Object.assign(settings, defaultSettings);
        await saveSettings();
        showNotification('设置已重置为默认值', 'success');
      };
    };
    
    // 导出数据
    const exportData = async () => {
      try {
        const data = await exportAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `whole-brain-training-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('数据导出成功', 'success');
      } catch (error) {
        showNotification('导出数据失败: ' + error.message, 'error');
      }
    };
    
    // 显示导入对话框
    const showImportDialog = () => {
      fileInput.value.click();
    };
    
    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          showConfirmDialog.value = true;
          confirmDialogTitle.value = '导入数据';
          confirmDialogMessage.value = '是否保留当前设置？选择"确认"将只导入训练数据，选择"取消"将同时导入设置和训练数据。';
          confirmDialogCallback.value = async () => {
            try {
              // 保留当前设置
              await importData(data, true);
              await loadSettings(); // 重新加载设置
              showNotification('数据导入成功（保留当前设置）', 'success');
            } catch (error) {
              showNotification('导入数据失败: ' + error.message, 'error');
            }
          };
          
          cancelDialogCallback.value = async () => {
            try {
              // 不保留当前设置
              await importData(data, false);
              await loadSettings(); // 重新加载设置
              showNotification('数据导入成功（使用导入的设置）', 'success');
            } catch (error) {
              showNotification('导入数据失败: ' + error.message, 'error');
            }
          };
        } catch (error) {
          showNotification('无效的数据文件: ' + error.message, 'error');
        }
        
        // 重置文件输入，允许再次选择同一文件
        event.target.value = '';
      };
      
      reader.onerror = () => {
        showNotification('读取文件失败', 'error');
        event.target.value = '';
      };
      
      reader.readAsText(file);
    };
    
    // 确认清除数据
    const confirmClearData = () => {
      showConfirmDialog.value = true;
      confirmDialogTitle.value = '清除所有数据';
      confirmDialogMessage.value = '此操作将永久删除所有训练数据' + (keepSettings.value ? '，但会保留设置' : '和设置') + '，无法恢复。确定要继续吗？';
      confirmDialogCallback.value = async () => {
        try {
          await clearAllData(keepSettings.value);
          if (!keepSettings.value) {
            const defaultSettings = getDefaultSettings();
            Object.assign(settings, defaultSettings);
            originalSettings.value = JSON.parse(JSON.stringify(defaultSettings));
          } else {
            // 重新加载设置
            await loadSettings();
          }
          showNotification('所有数据已清除', 'success');
        } catch (error) {
          showNotification('清除数据失败: ' + error.message, 'error');
        }
      };
    };
    
    // 创建手动备份
    const createManualBackup = async () => {
      try {
        await createAutoBackup();
        await loadLastBackupInfo();
        showNotification('备份已创建', 'success');
      } catch (error) {
        showNotification('创建备份失败: ' + error.message, 'error');
      }
    };
    
    // 从备份恢复
    const restoreFromBackup = () => {
      confirmDialogTitle.value = '从备份恢复';
      confirmDialogMessage.value = '确定要从最后一次备份恢复数据吗？当前数据将被覆盖。';
      confirmDialogCallback.value = performRestore;
      showConfirmDialog.value = true;
    };
    
    // 执行恢复
    const performRestore = async () => {
      try {
        await restoreFromAutoBackup();
        showNotification('数据已从备份恢复', 'success');
        // 重新加载设置
        loadSettings();
      } catch (error) {
        showNotification('恢复数据失败: ' + error.message, 'error');
      }
    };
    
    // 格式化备份日期
    const formatBackupDate = (dateString) => {
      if (!dateString) return '无';
      
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 确认对话框操作
    const confirmDialogAction = async () => {
      if (confirmDialogCallback.value) {
        await confirmDialogCallback.value();
      }
      showConfirmDialog.value = false;
    };
    
    // 取消对话框
    const cancelDialog = () => {
      if (cancelDialogCallback.value) {
        cancelDialogCallback.value();
        cancelDialogCallback.value = null;
      }
      showConfirmDialog.value = false;
    };
    
    // 显示通知
    const showNotification = (message, type = 'info') => {
      // 清除之前的超时
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }
      
      // 设置新通知
      notification.show = true;
      notification.message = message;
      notification.type = type;
      
      // 3秒后自动隐藏
      notification.timeout = setTimeout(() => {
        notification.show = false;
      }, 3000);
    };
    
    // 应用主题
    const applyTheme = (theme) => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      } else if (theme === 'auto') {
        // 根据系统主题设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        }
      }
    };
    
    // 检查是否有未保存的更改
    const hasUnsavedChanges = computed(() => {
      return JSON.stringify(settings) !== JSON.stringify(originalSettings.value);
    });
    
    // 监听路由变化，重置通知状态
    watch(() => route.path, (newPath) => {
      if (newPath !== '/settings') {
        // 当切换到其他页面时，清除通知
        notification.show = false;
        if (notification.timeout) {
          clearTimeout(notification.timeout);
          notification.timeout = null;
        }
      }
    }, { immediate: true });

    // 组件挂载时加载设置
    onMounted(async () => {
      await loadSettings();
      applyTheme(settings.theme);
    });
    
    return {
      settings,
      fileInput,
      showConfirmDialog,
      confirmDialogTitle,
      confirmDialogMessage,
      notification,
      hasUnsavedChanges,
      saveSettings,
      resetSettings,
      exportData,
      showImportDialog,
      handleFileUpload,
      confirmClearData,
      confirmDialogAction,
      cancelDialog,
      createManualBackup,
      restoreFromBackup,
      formatBackupDate
    };
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.settings-section {
  background-color: var(--color-card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.setting-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px 0;
}

label {
  font-weight: 500;
  color: var(--color-text-primary);
}

select, input[type="number"] {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-input-bg);
  color: var(--color-text-primary);
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.data-management-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}

.btn.primary {
  background-color: var(--color-primary);
  color: white;
}

.btn.primary:hover {
  background-color: var(--color-primary-dark);
}

.btn.secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn.secondary:hover {
  background-color: var(--color-secondary-dark);
}

.btn.danger {
  background-color: var(--color-danger);
  color: white;
}

.btn.danger:hover {
  background-color: var(--color-danger-dark);
}

/* 确认对话框 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: var(--color-card-bg);
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.confirm-dialog h3 {
  margin-top: 0;
  color: var(--color-text-primary);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 通知提示 */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.notification.success {
  background-color: var(--color-success);
}

.notification.error {
  background-color: var(--color-danger);
}

.notification.info {
  background-color: var(--color-info);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  select, input[type="number"] {
    width: 100%;
  }
  
  .data-management-buttons {
    flex-direction: column;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>