<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑知识库' : '创建知识库'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="知识库名称" prop="displayName">
        <el-input
          v-model="formData.displayName"
          placeholder="请输入知识库名称"
          maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <el-form-item label="知识库类型">
        <div class="type-display">
          <div class="type-info">
            <el-icon v-if="formData.type === 'PERSONAL'"><User /></el-icon>
            <el-icon v-else><UserFilled /></el-icon>
            <span class="type-name">
              {{ formData.type === 'PERSONAL' ? '个人知识库' : '公共知识库' }}
            </span>
          </div>
          <div class="type-description">
            {{ formData.type === 'PERSONAL' 
                ? '仅您可以查看和管理，适合存储个人资料和私密文档' 
                : '所有用户都可以查看，适合共享团队资源和公开文档' 
            }}
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="知识库描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入知识库描述（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 知识库创建和编辑对话框组件
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, UserFilled } from '@element-plus/icons-vue'
import { createKnowledgeBaseApi, updateKnowledgeBaseApi, type KnowledgeBase, type CreateKnowledgeBaseDTO } from '@/api/KnowledgeBaseApi'

interface Props {
  modelValue: boolean
  knowledgeBase?: KnowledgeBase | null
  defaultType?: 'PERSONAL' | 'PUBLIC'
}

const props = withDefaults(defineProps<Props>(), {
  knowledgeBase: null,
  defaultType: 'PERSONAL'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
  'updated': []
}>()

// 响应式数据
const dialogVisible = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()

// 判断是否为编辑模式
const isEdit = ref(false)

// 表单数据
const formData = reactive<CreateKnowledgeBaseDTO>({
  displayName: '',
  type: 'PERSONAL',
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  displayName: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { min: 2, max: 50, message: '知识库名称长度应在 2-50 个字符之间', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, 
      message: '知识库名称只能包含中文、英文、数字、下划线和短横线', 
      trigger: 'blur' 
    }
  ]
}

// 监听对话框显示状态
watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    initForm()
  }
})

watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 初始化表单
const initForm = () => {
  isEdit.value = !!props.knowledgeBase
  
  if (isEdit.value && props.knowledgeBase) {
    // 编辑模式：填充现有数据
    formData.displayName = props.knowledgeBase.displayName
    formData.type = props.knowledgeBase.type
    formData.description = props.knowledgeBase.description || ''
  } else {
    // 创建模式：使用传入的默认类型
    formData.displayName = ''
    formData.type = props.defaultType
    formData.description = ''
  }
  
  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    isSubmitting.value = true
    
    if (isEdit.value && props.knowledgeBase) {
      // 编辑知识库
      const response = await updateKnowledgeBaseApi(props.knowledgeBase.id, formData)
      if (response.code === 0) {
        ElMessage.success('知识库更新成功')
        emit('updated')
        handleClose()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 创建知识库
      const response = await createKnowledgeBaseApi(formData)
      if (response.code === 0) {
        ElMessage.success('知识库创建成功')
        emit('created')
        handleClose()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新知识库失败' : '创建知识库失败')
  } finally {
    isSubmitting.value = false
  }
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单状态
  isSubmitting.value = false
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.type-display {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.type-name {
  font-size: 14px;
}

.type-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  margin-left: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}
</style>