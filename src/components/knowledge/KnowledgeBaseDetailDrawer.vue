<template>
  <el-drawer
    v-model="drawerVisible"
    :title="knowledgeBase?.displayName || '知识库详情'"
    direction="rtl"
    size="60%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="knowledgeBase" class="drawer-content">
      <!-- 知识库信息 -->
      <div class="kb-info-section">
        <div class="section-header">
          <h3>
            <el-icon><InfoFilled /></el-icon>
            知识库信息
          </h3>
        </div>
        <div class="kb-info-content">
          <div class="info-item">
            <span class="info-label">名称：</span>
            <span class="info-value">{{ knowledgeBase.displayName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">类型：</span>
            <el-tag :type="knowledgeBase.type === 'PERSONAL' ? 'primary' : 'success'" size="small">
              {{ knowledgeBase.type === 'PERSONAL' ? '个人知识库' : '公共知识库' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">描述：</span>
            <span class="info-value">{{ knowledgeBase.description || '暂无描述' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件数量：</span>
            <span class="info-value">{{ knowledgeBase.fileCount || 0 }} 个</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDateTime(knowledgeBase.createTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="upload-section">
        <div class="section-header">
          <h3>
            <el-icon><UploadFilled /></el-icon>
            文件上传
          </h3>
        </div>
        <el-upload
          class="upload-area"
          drag
          multiple
          v-model:file-list="fileList"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            拖拽文件至此或<em>点击选择文件</em>进行上传
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF、DOC、DOCX、TXT、MD、EXCEL 等格式，单个文件最大 100MB
            </div>
          </template>
        </el-upload>
        
        <div v-if="fileList.length > 0" class="upload-actions">
          <el-button type="primary" @click="handleUpload" :loading="isUploading">
            <el-icon><Upload /></el-icon>
            上传文件 ({{ fileList.length }})
          </el-button>
          <el-button @click="clearFileList">
            <el-icon><Delete /></el-icon>
            清空列表
          </el-button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="files-section">
        <div class="section-header">
          <h3>
            <el-icon><Document /></el-icon>
            文件列表
          </h3>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文件名"
              style="width: 200px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="loadFiles" :loading="isLoadingFiles">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
        
        <div class="files-content" v-loading="isLoadingFiles">
          <div v-if="filteredFiles.length === 0" class="empty-files">
            <el-empty description="暂无文件" />
          </div>
          <div v-else class="files-list">
            <div
              v-for="file in filteredFiles"
              :key="file.id"
              class="file-item"
            >
              <div class="file-info">
                <div class="file-icon">
                  <el-icon size="24" :color="getFileIconColor(file.fileType)">
                    <component :is="getFileIcon(file.fileType)" />
                  </el-icon>
                </div>
                <div class="file-details">
                  <div class="file-name" :title="file.originalName">
                    {{ file.originalName }}
                  </div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                    <span class="file-time">{{ formatDateTime(file.createTime) }}</span>
                  </div>
                </div>
              </div>
              <div class="file-actions">
                <el-button size="small" @click="handleDownload(file)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteFile(file)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
/**
 * 知识库详情和文件管理抽屉组件
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, type UploadUserFile } from 'element-plus'
import {
  InfoFilled,
  UploadFilled,
  Upload,
  Document,
  Search,
  Refresh,
  Download,
  Delete,
  DocumentCopy,
  Picture,
  VideoPlay,
  Files
} from '@element-plus/icons-vue'
import {
  getKnowledgeBaseFilesApi,
  uploadFileToKnowledgeBaseApi,
  deleteKnowledgeBaseFileApi,
  type KnowledgeBase,
  type KnowledgeBaseFile
} from '@/api/KnowledgeBaseApi'

interface Props {
  modelValue: boolean
  knowledgeBase: KnowledgeBase | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'file-uploaded': []
  'file-deleted': []
}>()

// 响应式数据
const drawerVisible = ref(false)
const fileList = ref<UploadUserFile[]>([])
const files = ref<KnowledgeBaseFile[]>([])
const searchKeyword = ref('')
const isUploading = ref(false)
const isLoadingFiles = ref(false)

// 监听对话框显示状态
watch(() => props.modelValue, (newValue) => {
  drawerVisible.value = newValue
  if (newValue && props.knowledgeBase) {
    loadFiles()
  }
})

watch(drawerVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 计算属性：过滤后的文件列表
const filteredFiles = computed(() => {
  if (!searchKeyword.value) {
    return files.value
  }
  return files.value.filter(file =>
    file.originalName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载文件列表
const loadFiles = async () => {
  if (!props.knowledgeBase) return
  
  isLoadingFiles.value = true
  try {
    const response = await getKnowledgeBaseFilesApi(props.knowledgeBase.id)
    if (response.code === 0) {
      files.value = response.data
    } else {
      ElMessage.error(response.message || '加载文件列表失败')
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
    ElMessage.error('加载文件列表失败')
  } finally {
    isLoadingFiles.value = false
  }
}

// 处理文件变化
const handleFileChange = (file: UploadUserFile) => {
  // 检查文件大小（100MB限制）
  const maxSize = 100 * 1024 * 1024
  if (file.raw && file.raw.size > maxSize) {
    ElMessage.error(`文件 ${file.name} 超过了最大上传大小限制 (100MB)`)
    // 移除超大文件
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
    return
  }
}

// 处理文件移除
const handleFileRemove = (file: UploadUserFile) => {
  console.log('移除文件:', file.name)
}

// 处理文件上传
const handleUpload = async () => {
  if (!props.knowledgeBase || fileList.value.length === 0) return
  
  isUploading.value = true
  try {
    const uploadPromises = fileList.value.map(file => {
      if (file.raw) {
        return uploadFileToKnowledgeBaseApi(props.knowledgeBase!.id, file.raw)
      }
      return Promise.resolve(null)
    })
    
    const results = await Promise.allSettled(uploadPromises)
    
    let successCount = 0
    let failCount = 0
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value && result.value.code === 0) {
        successCount++
      } else {
        failCount++
        console.error(`文件 ${fileList.value[index].name} 上传失败:`, result)
      }
    })
    
    if (successCount > 0) {
      ElMessage.success(`成功上传 ${successCount} 个文件`)
      emit('file-uploaded')
      clearFileList()
      loadFiles()
    }
    
    if (failCount > 0) {
      ElMessage.warning(`${failCount} 个文件上传失败`)
    }
  } catch (error) {
    console.error('批量上传失败:', error)
    ElMessage.error('文件上传失败')
  } finally {
    isUploading.value = false
  }
}

// 清空文件列表
const clearFileList = () => {
  fileList.value = []
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 处理文件下载
const handleDownload = (file: KnowledgeBaseFile) => {
  // 创建下载链接
  const link = document.createElement('a')
  link.href = file.fileUrl
  link.download = file.originalName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 处理文件删除
const handleDeleteFile = async (file: KnowledgeBaseFile) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件"${file.originalName}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await deleteKnowledgeBaseFileApi(file.id)
    if (response.code === 0) {
      ElMessage.success('文件删除成功')
      emit('file-deleted')
      loadFiles()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除文件失败')
    }
  }
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  if (!fileType) return Files
  
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return DocumentCopy
  if (type.includes('doc') || type.includes('txt') || type.includes('md')) return Document
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return Picture
  if (type.includes('video') || type.includes('mp4') || type.includes('avi')) return VideoPlay
  return Files
}

// 获取文件图标颜色
const getFileIconColor = (fileType: string) => {
  if (!fileType) return '#909399'
  
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return '#f56c6c'
  if (type.includes('doc') || type.includes('txt') || type.includes('md')) return '#409eff'
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '#67c23a'
  if (type.includes('video') || type.includes('mp4') || type.includes('avi')) return '#e6a23c'
  return '#909399'
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (!size) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  
  return `${fileSize.toFixed(1)} ${units[index]}`
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '未知时间'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '未知时间'
  }
}

// 处理关闭
const handleClose = () => {
  drawerVisible.value = false
  // 清理状态
  clearFileList()
  searchKeyword.value = ''
}
</script>

<style scoped>
.drawer-content {
  padding: 0 20px 20px 0;
  height: 100%;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 知识库信息区域 */
.kb-info-section {
  margin-bottom: 32px;
}

.kb-info-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  flex: 1;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 32px;
}

.upload-area {
  margin-bottom: 16px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 文件列表区域 */
.files-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.files-content {
  flex: 1;
  min-height: 300px;
}

.empty-files {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}

/* 滚动条样式 */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #f5f5f5;
}
</style>