<!--
  知识库选择器组件
  支持搜索和多选功能，显示知识库类型标识
  
  @author yunzhongxiaoma
  @since 1.0.0
-->
<template>
  <div class="knowledge-base-selector">
    <el-select
      v-model="selectedKnowledgeBases"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="选择知识库进行问答"
      :remote-method="searchKnowledgeBases"
      :loading="loading"
      @change="handleSelectionChange"
      class="kb-selector"
      clearable
    >
      <template #prefix>
        <el-icon><Collection /></el-icon>
      </template>
      
      <el-option
        v-for="kb in knowledgeBaseOptions"
        :key="kb.id"
        :label="kb.displayName"
        :value="kb.id"
      >
        <div class="option-content">
          <div class="option-left">
            <el-icon class="option-icon">
              <Folder v-if="kb.type === 'PERSONAL'" />
              <FolderOpened v-else />
            </el-icon>
            <span class="option-name">{{ kb.displayName }}</span>
          </div>
          <div class="option-right">
            <el-tag 
              :type="kb.type === 'PERSONAL' ? 'info' : 'success'" 
              size="small"
            >
              {{ kb.type === 'PERSONAL' ? '个人' : '公共' }}
            </el-tag>
            <span class="file-count">{{ kb.fileCount }}个文件</span>
          </div>
        </div>
      </el-option>
    </el-select>
    
    <!-- 选中的知识库显示 -->
    <div v-if="selectedKnowledgeBases.length > 0" class="selected-kbs">
      <div class="selected-header">
        <span>已选择 {{ selectedKnowledgeBases.length }} 个知识库：</span>
        <el-button size="small" type="text" @click="clearSelection">清空</el-button>
      </div>
      <div class="selected-tags">
        <el-tag
          v-for="kbId in selectedKnowledgeBases"
          :key="kbId"
          closable
          @close="removeKnowledgeBase(kbId)"
          class="selected-tag"
        >
          {{ getKnowledgeBaseName(kbId) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Collection, Folder, FolderOpened } from '@element-plus/icons-vue'
import { 
  searchKnowledgeBasesApi, 
  getAccessibleKnowledgeBasesApi,
  type KnowledgeBase 
} from '@/api/KnowledgeBaseApi'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  'change': [selectedKbs: KnowledgeBase[]]
}>()

const selectedKnowledgeBases = ref<number[]>(props.modelValue)
const knowledgeBaseOptions = ref<KnowledgeBase[]>([])
const loading = ref(false)

// 初始化时加载可访问的知识库
onMounted(async () => {
  await loadAccessibleKnowledgeBases()
})

// 加载可访问的知识库
const loadAccessibleKnowledgeBases = async () => {
  loading.value = true
  try {
    const response = await getAccessibleKnowledgeBasesApi()
    if (response.code === 0) {
      knowledgeBaseOptions.value = response.data
    }
  } catch (error) {
    console.error('加载可访问知识库失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索知识库
const searchKnowledgeBases = async (query: string) => {
  if (!query) {
    // 如果没有搜索关键词，显示所有可访问的知识库
    await loadAccessibleKnowledgeBases()
    return
  }
  
  loading.value = true
  try {
    const response = await searchKnowledgeBasesApi(query)
    if (response.code === 0) {
      knowledgeBaseOptions.value = response.data
    }
  } catch (error) {
    console.error('搜索知识库失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (value: number[]) => {
  selectedKnowledgeBases.value = value
  emit('update:modelValue', value)
  
  const selectedKbs = knowledgeBaseOptions.value.filter(kb => 
    value.includes(kb.id)
  )
  emit('change', selectedKbs)
}

// 获取知识库名称
const getKnowledgeBaseName = (kbId: number) => {
  const kb = knowledgeBaseOptions.value.find(kb => kb.id === kbId)
  return kb?.displayName || `知识库${kbId}`
}

// 移除知识库
const removeKnowledgeBase = (kbId: number) => {
  const newValue = selectedKnowledgeBases.value.filter(id => id !== kbId)
  handleSelectionChange(newValue)
}

// 清空选择
const clearSelection = () => {
  handleSelectionChange([])
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  selectedKnowledgeBases.value = newValue
})
</script>

<style scoped>
.knowledge-base-selector {
  width: 100%;
}

.kb-selector {
  width: 100%;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.option-icon {
  color: #409eff;
}

.option-name {
  font-weight: 500;
}

.option-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.file-count {
  white-space: nowrap;
}

.selected-kbs {
  margin-top: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  margin: 0;
}
</style>