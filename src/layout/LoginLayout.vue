<template>
  <div class="login-layout">
    <div class="login-background">
      <!-- 背景装饰元素 -->
      <div class="bg-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
      </div>
      
      <!-- 登录内容区域 -->
      <div class="login-content">
        <div class="login-card">
          <div class="login-header">
            <div class="logo">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1>RAG-AI</h1>
            </div>
            <p class="subtitle">智能知识库问答系统</p>
          </div>
          
          <RouterView />
        </div>
        
        <!-- 系统介绍 -->
        <div class="system-intro">
          <h2>欢迎使用 RAG-AI 系统</h2>
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">🤖</div>
              <h3>智能问答</h3>
              <p>基于RAG技术的AI对话系统</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <h3>知识管理</h3>
              <p>支持多种格式文档上传与检索</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <h3>安全可靠</h3>
              <p>完善的用户认证与权限管理</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 登录布局组件
</script>

<style scoped lang="less">
.login-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-background {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 背景装饰
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    
    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
      
      &.circle-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      &.circle-2 {
        width: 150px;
        height: 150px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }
      
      &.circle-3 {
        width: 100px;
        height: 100px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }
    }
    
    .wave {
      position: absolute;
      width: 200%;
      height: 200px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      animation: wave 8s linear infinite;
      
      &.wave-1 {
        top: -100px;
        left: -50%;
        animation-delay: 0s;
      }
      
      &.wave-2 {
        bottom: -100px;
        right: -50%;
        animation-delay: 4s;
      }
    }
  }
}

.login-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  max-width: 1200px;
  gap: 60px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 10px;
      
      .logo-icon {
        width: 40px;
        height: 40px;
        color: #667eea;
        
        svg {
          width: 100%;
          height: 100%;
        }
      }
      
      h1 {
        font-size: 32px;
        font-weight: 700;
        color: #2d3748;
        margin: 0;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .subtitle {
      color: #718096;
      font-size: 16px;
      margin: 0;
    }
  }
}

.system-intro {
  color: white;
  max-width: 500px;
  
  h2 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 30px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .features {
    display: flex;
    flex-direction: column;
    gap: 25px;
    
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      
      .feature-icon {
        font-size: 24px;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      div:not(.feature-icon) {
        flex: 1;
      }
      
      h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      
      p {
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
        line-height: 1.5;
      }
    }
  }
}

// 动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: 40px;
    
    .system-intro {
      text-align: center;
      
      .features {
        .feature-item {
          flex-direction: column;
          text-align: center;
          align-items: center;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .login-card {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .system-intro {
    padding: 0 20px;
    
    h2 {
      font-size: 28px;
    }
  }
}
</style>