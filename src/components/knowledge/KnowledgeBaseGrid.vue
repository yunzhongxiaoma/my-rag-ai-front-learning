<template>
  <div class="knowledge-base-grid" v-loading="loading">
    <!-- 创建知识库按钮 - 始终显示在顶部 -->
    <div class="grid-header">
      <el-button 
        type="primary" 
        @click="$emit('create')"
        class="create-kb-btn"
      >
        <el-icon><Plus /></el-icon>
        创建知识库
      </el-button>
    </div>

    <div v-if="knowledgeBases.length === 0" class="empty-state">
      <el-empty description="暂无知识库">
        <template #description>
          <p>还没有任何知识库，点击上方按钮创建第一个知识库吧！</p>
        </template>
      </el-empty>
    </div>
    
    <div v-else class="grid-container">
      <div 
        v-for="kb in knowledgeBases" 
        :key="kb.id"
        class="knowledge-base-card"
        @click="$emit('select', kb)"
      >
        <el-card shadow="hover" class="kb-card">
          <div class="card-header">
            <div class="kb-icon">
              <el-icon size="24" :color="kb.type === 'PERSONAL' ? '#409EFF' : '#67C23A'">
                <Folder v-if="kb.type === 'PERSONAL'" />
                <FolderOpened v-else />
              </el-icon>
            </div>
            <div class="kb-type-badge">
              <el-tag :type="kb.type === 'PERSONAL' ? 'primary' : 'success'" size="small">
                {{ kb.type === 'PERSONAL' ? '个人' : '公共' }}
              </el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="kb-name" :title="kb.displayName">{{ kb.displayName }}</h3>
            <p class="kb-description" :title="kb.description || '暂无描述'">
              {{ kb.description || '暂无描述' }}
            </p>
            <div class="kb-stats">
              <span class="file-count">
                <el-icon><Document /></el-icon>
                {{ kb.fileCount || 0 }} 个文件
              </span>
              <span class="create-time">
                {{ formatDate(kb.createTime) }}
              </span>
            </div>
          </div>
          
          <div class="card-actions" @click.stop>
            <el-button size="small" @click="$emit('edit', kb)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="$emit('delete', kb)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 知识库网格展示组件
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import { Folder, FolderOpened, Document, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { KnowledgeBase } from '@/api/KnowledgeBaseApi'

defineProps<{
  knowledgeBases: KnowledgeBase[]
  type: 'personal' | 'public'
  loading: boolean
}>()

defineEmits<{
  select: [kb: KnowledgeBase]
  edit: [kb: KnowledgeBase]
  delete: [kb: KnowledgeBase]
  create: []
}>()

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知时间'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return '未知时间'
  }
}
</script>

<style scoped>
.knowledge-base-grid {
  min-height: 400px;
}

.grid-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 0 10px;
}

.create-kb-btn {
  border-radius: 8px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.knowledge-base-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge-base-card:hover {
  transform: translateY(-4px);
}

.kb-card {
  height: auto;
  min-height: 240px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.kb-card:hover {
  border-color: #409EFF;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.kb-card :deep(.el-card__body) {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.kb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kb-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.kb-description {
  color: #606266;
  font-size: 14px;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 42px;
  flex: 1;
}

.kb-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-bottom: 15px;
  margin-top: auto;
}

.file-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.create-time {
  font-size: 12px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 15px;
  border-top: 1px solid #f0f2f5;
  margin-top: auto;
}

.card-actions .el-button {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-header {
    justify-content: center;
    margin-bottom: 15px;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .kb-card {
    min-height: 220px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .card-actions .el-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>