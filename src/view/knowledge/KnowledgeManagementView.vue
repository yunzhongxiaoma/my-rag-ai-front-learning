<template>
  <div class="knowledge-management-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>知识库管理</h2>
      <div class="header-actions">
        <el-button type="warning" @click="handleFixFileCount" :loading="isFixing">
          <el-icon><Tools /></el-icon>
          修复文件计数
        </el-button>
      </div>
    </div>

    <!-- 知识库分类标签页 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="knowledge-tabs">
        <el-tab-pane label="个人知识库" name="personal">
          <KnowledgeBaseGrid 
            :knowledge-bases="personalKnowledgeBases"
            type="personal"
            :loading="isLoading"
            @select="handleKnowledgeBaseSelect"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="() => handleCreateKnowledgeBase('PERSONAL')"
          />
        </el-tab-pane>
        <el-tab-pane label="公共知识库" name="public">
          <KnowledgeBaseGrid 
            :knowledge-bases="publicKnowledgeBases"
            type="public"
            :loading="isLoading"
            @select="handleKnowledgeBaseSelect"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="() => handleCreateKnowledgeBase('PUBLIC')"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 创建知识库对话框 -->
    <CreateKnowledgeBaseDialog 
      v-model="showCreateDialog"
      :default-type="createKnowledgeBaseType"
      @created="handleKnowledgeBaseCreated"
    />

    <!-- 知识库详情抽屉 -->
    <KnowledgeBaseDetailDrawer
      v-model="showDetailDrawer"
      :knowledge-base="selectedKnowledgeBase"
      @file-uploaded="handleFileUploaded"
      @file-deleted="handleFileDeleted"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 知识库管理主页面组件
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Tools } from '@element-plus/icons-vue'
import KnowledgeBaseGrid from '@/components/knowledge/KnowledgeBaseGrid.vue'
import CreateKnowledgeBaseDialog from '@/components/knowledge/CreateKnowledgeBaseDialog.vue'
import KnowledgeBaseDetailDrawer from '@/components/knowledge/KnowledgeBaseDetailDrawer.vue'
import { 
  getKnowledgeBasesApi, 
  deleteKnowledgeBaseApi,
  type KnowledgeBase 
} from '@/api/KnowledgeBaseApi'
import { fixKnowledgeBaseFileCountApi } from '@/api/AdminApi'

// 响应式数据
const activeTab = ref('personal')
const isLoading = ref(false)
const isFixing = ref(false)
const showCreateDialog = ref(false)
const showDetailDrawer = ref(false)
const knowledgeBases = ref<KnowledgeBase[]>([])
const selectedKnowledgeBase = ref<KnowledgeBase | null>(null)
const createKnowledgeBaseType = ref<'PERSONAL' | 'PUBLIC'>('PERSONAL')

// 计算属性
const personalKnowledgeBases = computed(() => 
  knowledgeBases.value.filter(kb => kb.type === 'PERSONAL')
)

const publicKnowledgeBases = computed(() => 
  knowledgeBases.value.filter(kb => kb.type === 'PUBLIC')
)

// 方法
const loadKnowledgeBases = async (type?: 'PERSONAL' | 'PUBLIC') => {
  isLoading.value = true
  try {
    const response = await getKnowledgeBasesApi(type)
    if (response.code === 0) {
      if (type) {
        // 如果指定了类型，只更新对应类型的数据
        const newData = response.data
        if (type === 'PERSONAL') {
          knowledgeBases.value = [
            ...knowledgeBases.value.filter(kb => kb.type !== 'PERSONAL'),
            ...newData
          ]
        } else {
          knowledgeBases.value = [
            ...knowledgeBases.value.filter(kb => kb.type !== 'PUBLIC'),
            ...newData
          ]
        }
      } else {
        // 加载所有数据
        knowledgeBases.value = response.data
      }
    } else {
      ElMessage.error(response.message || '加载知识库失败')
    }
  } catch (error) {
    console.error('加载知识库失败:', error)
    ElMessage.error('加载知识库失败')
  } finally {
    isLoading.value = false
  }
}

const handleTabClick = (tab: any) => {
  // 切换标签页时重新查询对应类型的数据
  const tabName = tab.props.name
  console.log('切换到标签页:', tabName)
  
  if (tabName === 'personal') {
    loadKnowledgeBases('PERSONAL')
  } else if (tabName === 'public') {
    loadKnowledgeBases('PUBLIC')
  }
}

const handleCreateKnowledgeBase = (type: 'PERSONAL' | 'PUBLIC') => {
  createKnowledgeBaseType.value = type
  showCreateDialog.value = true
}

const handleKnowledgeBaseSelect = (knowledgeBase: KnowledgeBase) => {
  selectedKnowledgeBase.value = knowledgeBase
  showDetailDrawer.value = true
}

const handleKnowledgeBaseCreated = () => {
  loadKnowledgeBases()
  showCreateDialog.value = false
  ElMessage.success('知识库创建成功')
}

const handleEdit = (_knowledgeBase: KnowledgeBase) => {
  // TODO: 实现编辑知识库逻辑
  ElMessage.info('编辑功能待实现')
}

const handleDelete = async (knowledgeBase: KnowledgeBase) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除知识库"${knowledgeBase.displayName}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await deleteKnowledgeBaseApi(knowledgeBase.id)
    if (response.code === 0) {
      ElMessage.success('知识库删除成功')
      loadKnowledgeBases()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除知识库失败:', error)
      ElMessage.error('删除知识库失败')
    }
  }
}

const handleFileUploaded = () => {
  // 文件上传成功后刷新知识库列表
  loadKnowledgeBases()
}

const handleFileDeleted = () => {
  // 文件删除成功后刷新知识库列表
  loadKnowledgeBases()
}

const handleFixFileCount = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将修复所有知识库的文件计数，确保数据一致性。是否继续？',
      '修复文件计数',
      {
        confirmButtonText: '确定修复',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    isFixing.value = true
    const response = await fixKnowledgeBaseFileCountApi()
    
    if (response.code === 0) {
      ElMessage.success(response.data || '文件计数修复成功')
      // 刷新知识库列表以显示最新的文件计数
      loadKnowledgeBases()
    } else {
      ElMessage.error(response.message || '修复失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修复文件计数失败:', error)
      ElMessage.error('修复文件计数失败')
    }
  } finally {
    isFixing.value = false
  }
}

onMounted(() => {
  // 初始加载个人知识库数据
  loadKnowledgeBases('PERSONAL')
})
</script>

<style scoped>
@import '@/styles/knowledge-management.scss';
</style>