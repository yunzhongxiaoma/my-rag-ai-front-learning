<template>
  <div class="login-page">
    <!-- 登录表单 -->
    <div class="login-form-container" v-if="!showRegister">
      <h2 class="form-title">登录账户</h2>
      <p class="form-subtitle">欢迎回来，请输入您的账户信息</p>
      
      <el-form 
        :model="loginForm" 
        ref="loginFormRef" 
        :rules="loginRules"
        @keyup.enter="handleLogin"
        v-loading="isLoading"
        element-loading-text="登录中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-form-item prop="userName">
          <el-input 
            v-model="loginForm.userName" 
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="handleLogin"
            :loading="isLoading"
            class="login-btn"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="form-footer">
        <span>还没有账户？</span>
        <el-button type="text" @click="showRegister = true" class="switch-btn">
          立即注册
        </el-button>
      </div>
    </div>
    
    <!-- 注册表单 -->
    <div class="register-form-container" v-else>
      <h2 class="form-title">创建账户</h2>
      <p class="form-subtitle">请填写以下信息完成注册</p>
      
      <el-form 
        :model="registerForm" 
        ref="registerFormRef" 
        :rules="registerRules"
        v-loading="isLoading"
        element-loading-text="注册中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item prop="name">
              <el-input 
                v-model="registerForm.name" 
                placeholder="真实姓名"
                size="large"
                prefix-icon="UserFilled"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="userName">
              <el-input 
                v-model="registerForm.userName" 
                placeholder="用户名"
                size="large"
                prefix-icon="User"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="设置密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item prop="phone">
              <el-input 
                v-model="registerForm.phone" 
                placeholder="手机号码"
                size="large"
                prefix-icon="Phone"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="sex">
              <el-select 
                v-model="registerForm.sex" 
                placeholder="性别"
                size="large"
                style="width: 100%"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item prop="idNumber">
          <el-input 
            v-model="registerForm.idNumber" 
            placeholder="身份证号码"
            size="large"
            prefix-icon="CreditCard"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="handleRegister"
            :loading="isLoading"
            class="register-btn"
          >
            {{ isLoading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="form-footer">
        <span>已有账户？</span>
        <el-button type="text" @click="showRegister = false" class="switch-btn">
          立即登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { BASE_URL } from '@/http/config'

const router = useRouter()
const showRegister = ref(false)
const isLoading = ref(false)
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 登录表单
const loginForm = reactive({
  userName: '',
  password: '',
})

// 注册表单
const registerForm = reactive({
  name: '',
  userName: '',
  password: '',
  phone: '',
  sex: '男',
  idNumber: '',
  status: 1
})

// 登录表单验证规则
const loginRules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules: FormRules = {
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idNumber: [
    { required: true, message: '请输入身份证号码', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        isLoading.value = true
        const response = await fetch(`${BASE_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `userName=${encodeURIComponent(loginForm.userName)}&password=${encodeURIComponent(loginForm.password)}`
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.code === 0) {
          // 存储登录信息
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('userRole', data.data.userName)
          localStorage.setItem('userId', data.data.id)
          
          ElMessage.success('登录成功！')
          
          // 跳转到主应用
          router.push('/')
        } else {
          ElMessage.error(data.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        isLoading.value = true
        const response = await fetch(`${BASE_URL}/user/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerForm),
        })
        const data = await response.json()
        
        if (data.code === 0) {
          ElMessage.success('注册成功！请登录')
          showRegister.value = false
          // 清空注册表单
          Object.assign(registerForm, {
            name: '',
            userName: '',
            password: '',
            phone: '',
            sex: '男',
            idNumber: '',
            status: 1
          })
        } else {
          ElMessage.error(data.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<style scoped lang="less">
.login-page {
  width: 100%;
}

.login-form-container,
.register-form-container {
  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: #2d3748;
    margin: 0 0 8px 0;
    text-align: center;
  }
  
  .form-subtitle {
    color: #718096;
    font-size: 14px;
    margin: 0 0 30px 0;
    text-align: center;
  }
  
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
      
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }
      }
      
      :deep(.el-input__inner) {
        font-size: 16px;
        padding: 12px 16px;
      }
      
      :deep(.el-select) {
        width: 100%;
        
        .el-input__wrapper {
          border-radius: 12px;
        }
      }
    }
    
    .login-btn,
    .register-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
  
  .form-footer {
    text-align: center;
    margin-top: 20px;
    color: #718096;
    font-size: 14px;
    
    .switch-btn {
      color: #667eea;
      font-weight: 600;
      padding: 0 4px;
      
      &:hover {
        color: #764ba2;
      }
    }
  }
}

// 表单动画
.login-form-container,
.register-form-container {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-form-container,
  .register-form-container {
    .form-title {
      font-size: 24px;
    }
    
    .el-form {
      .el-row {
        .el-col {
          &:first-child {
            margin-bottom: 20px;
          }
        }
      }
    }
  }
}
</style>