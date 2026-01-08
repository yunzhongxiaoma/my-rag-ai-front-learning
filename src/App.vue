<template>
  <div id="app">
    <!-- 登录页面布局 -->
    <LoginLayout v-if="isLoginRoute" />
    
    <!-- 主应用布局 -->
    <BasicLayout v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BasicLayout from "./layout/BasicLayout.vue"
import LoginLayout from "./layout/LoginLayout.vue"

const route = useRoute()

// 判断是否为登录相关路由
const isLoginRoute = computed(() => {
  return route.path === '/login' || route.name === 'login'
})
</script>

<style lang="less">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}

// Element Plus 样式覆盖
.el-message {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.el-loading-mask {
  border-radius: 12px;
}
</style>
