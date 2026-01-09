<template>
  <div class="user-profile-container">
    <div class="profile-header">
      <div class="avatar-section">
        <el-avatar :size="80" :src="avatarUrl" @error="() => true">
          {{ userInfo.userName?.charAt(0)?.toUpperCase() }}
        </el-avatar>
        <div class="user-basic-info">
          <h2>{{ userInfo.name }}</h2>
          <p>@{{ userInfo.userName }}</p>
          <el-tag type="success" size="small">在线</el-tag>
        </div>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="startEdit" :icon="Edit">编辑资料</el-button>
        <el-button @click="showPasswordDialog" :icon="Lock">修改密码</el-button>
        <el-button type="danger" @click="handleLogout" :icon="SwitchButton">退出登录</el-button>
      </div>
    </div>

    <div class="profile-content">
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><el-icon><User /></el-icon> 个人信息</span>
          </div>
        </template>
        
        <div class="user-info" v-if="!isEditing">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label"><el-icon><User /></el-icon> 姓名</span>
              <span class="info-value">{{ userInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><el-icon><UserFilled /></el-icon> 用户名</span>
              <span class="info-value">{{ userInfo.userName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><el-icon><Iphone /></el-icon> 手机号</span>
              <span class="info-value">{{ userInfo.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><el-icon><Male /></el-icon> 性别</span>
              <span class="info-value">{{ userInfo.sex }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><el-icon><Document /></el-icon> 身份证号</span>
              <span class="info-value">{{ maskIdNumber(userInfo.idNumber) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><el-icon><Timer /></el-icon> 创建时间</span>
              <span class="info-value">{{ formatDate(userInfo.createTime) }}</span>
            </div>
          </div>
        </div>

        <el-form v-else :model="editForm" ref="editFormRef" label-width="100px" :rules="editRules">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="editForm.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName">
                <el-input v-model="editForm.userName" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="editForm.sex" placeholder="请选择性别" style="width: 100%">
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="身份证号" prop="idNumber">
            <el-input v-model="editForm.idNumber" placeholder="请输入身份证号" />
          </el-form-item>
          
          <div class="edit-actions">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="handleUpdate" :loading="isLoading">保存</el-button>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdatePassword" :loading="isLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Edit, Lock, SwitchButton, User, UserFilled, Iphone, Male, Document, Timer } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { BASE_URL } from '@/http/config'
import { updatePasswordApi } from '@/api/UserApi'
import { fetchWithAuthJSON } from '@/utils/fetchWrapper'

interface UserInfo {
  id: number;
  name: string;
  userName: string;
  password: string;
  phone: string;
  sex: string;
  idNumber: string;
  status: number;
  createTime: string;
  updateTime: string;
  createUser: string | null;
  updateUser: string | null;
}

const router = useRouter()
const isLoading = ref(false)
const isEditing = ref(false)
const passwordDialogVisible = ref(false)
const avatarUrl = ref('')
const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const userInfo = ref<UserInfo>({
  id: 0,
  name: '',
  userName: '',
  password: '',
  phone: '',
  sex: '',
  idNumber: '',
  status: 1,
  createTime: '',
  updateTime: '',
  createUser: null,
  updateUser: null
})

const editForm = reactive({
  id: 0,
  userName: '',
  name: '',
  phone: '',
  sex: '',
  idNumber: ''
})

const passwordForm = reactive({
  id: 0,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 编辑表单验证规则
const editRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ]
}

// 密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (!token || !userId) {
      router.push('/login')
      return
    }
    
    const data = await fetchWithAuthJSON(`${BASE_URL}/user/${userId}`)
    if (data.code === 0) {
      userInfo.value = data.data
    } else {
      ElMessage.error('获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 开始编辑
const startEdit = () => {
  Object.assign(editForm, {
    id: userInfo.value.id,
    userName: userInfo.value.userName,
    name: userInfo.value.name,
    phone: userInfo.value.phone,
    sex: userInfo.value.sex,
    idNumber: userInfo.value.idNumber
  })
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 更新用户信息
const handleUpdate = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        isLoading.value = true
        const data = await fetchWithAuthJSON(`${BASE_URL}/user/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm)
        })
        if (data.code === 0) {
          ElMessage.success('更新成功')
          await fetchUserInfo()
          isEditing.value = false
        } else {
          ElMessage.error(data.message || '更新失败')
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        ElMessage.error('更新失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }
  })
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  Object.assign(passwordForm, {
    id: userInfo.value.id,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordDialogVisible.value = true
}

// 修改密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        isLoading.value = true
        const response = await updatePasswordApi(passwordForm)
        if (response.code === 0) {
          ElMessage.success('密码修改成功')
          passwordDialogVisible.value = false
          Object.assign(passwordForm, {
            id: userInfo.value.id,
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('密码修改失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }
  })
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    ElMessage.success('已成功退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 脱敏身份证号
const maskIdNumber = (idNumber: string) => {
  if (!idNumber) return '-'
  return idNumber.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="less">
.user-profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .avatar-section {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .el-avatar {
      border: 4px solid rgba(255, 255, 255, 0.3);
      font-size: 32px;
      font-weight: bold;
    }
    
    .user-basic-info {
      h2 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 12px 0;
        opacity: 0.9;
        font-size: 16px;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    
    .el-button {
      border-radius: 8px;
      
      &.el-button--primary {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
      
      &:not(.el-button--primary):not(.el-button--danger) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

.profile-content {
  .info-card {
    border-radius: 16px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .user-info {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        
        .info-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #667eea;
          
          .info-label {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 120px;
            color: #64748b;
            font-weight: 500;
            font-size: 14px;
          }
          
          .info-value {
            color: #1e293b;
            font-weight: 500;
            flex: 1;
          }
        }
      }
    }
    
    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    
    .action-buttons {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  
  .user-info .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>