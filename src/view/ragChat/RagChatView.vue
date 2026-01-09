<template>
  <div class="chat-container">
    <el-card class="box-card">
      <!-- 知识库选择区域 -->
      <div class="knowledge-base-selection">
        <div class="selection-header">
          <h4>选择知识库</h4>
          <el-tooltip content="选择要用于问答的知识库，支持多选">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <KnowledgeBaseSelector 
          v-model="selectedKnowledgeBases"
          @change="handleKnowledgeBaseChange"
        />
      </div>
      
      <!-- 历史记录加载状态 -->
      <div v-if="isLoadingHistory" class="loading-history">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载聊天历史...</span>
      </div>
      
      <div class="chat-messages" ref="messageContainer">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
          <div class="message-wrapper">
            <div class="message-content" :class="{ 'typing': message.isTyping }" v-html="renderMarkdown(message.content)">
            </div>
            <el-button
              class="copy-button"
              type="text"
              size="small"
              @click="copyMessage(message.content)"
            >
              <el-icon><Document /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div class="input-container">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          @keyup.enter="handleSend"
        />
      </div>

      <div class="button-group">
        <el-button type="info" @click="refreshHistory" :loading="isLoadingHistory">
          <el-icon><Refresh /></el-icon>
          刷新历史
        </el-button>
        <el-button type="warning" @click="clearMessages">清空对话</el-button>
        <el-button type="primary" @click="handleSend" :loading="isLoading">普通回答</el-button>
        <el-button 
          type="primary" 
          @click="handleRagSend" 
          :loading="isLoading"
          :disabled="selectedKnowledgeBases.length === 0"
        >
          RAG回答 ({{ selectedKnowledgeBases.length }}个知识库)
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { marked } from 'marked'
import { Document, Loading, Refresh, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  sendChatMessageApi, 
  sendRagChatMessageWithKnowledgeBasesApi,
  getChatHistoryApi,
  type ChatMessage,
  type ChatMessageVO,
  ChatApi
} from '@/api/ChatApi'
import { fetchWithAuth } from '@/utils/fetchWrapper'
import { BASE_URL } from '@/http/config'
import KnowledgeBaseSelector from '@/components/knowledge/KnowledgeBaseSelector.vue'
import type { KnowledgeBase } from '@/api/KnowledgeBaseApi'

const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const currentSessionId = ref<string | null>(null)

// 知识库选择相关
const selectedKnowledgeBases = ref<number[]>([])
const selectedKnowledgeBaseDetails = ref<KnowledgeBase[]>([])

// 消息持久化相关
const MESSAGES_STORAGE_KEY = 'rag-chat-messages'
const SESSION_STORAGE_KEY = 'rag-chat-session-id'
const AUTO_SAVE_INTERVAL = 5000 // 5秒自动保存一次

// 将后端消息VO转换为前端消息格式
const convertVOToMessage = (vo: ChatMessageVO): ChatMessage => {
  return {
    role: vo.messageType === 'USER' ? 'user' : 'assistant',
    content: vo.content,
    id: vo.id,
    createTime: vo.createTime
  }
}

// 从后端加载聊天历史
const loadChatHistoryFromServer = async () => {
  if (isLoadingHistory.value) return
  
  isLoadingHistory.value = true
  try {
    console.log('正在从服务器加载聊天历史...')
    
    // 获取保存的会话ID
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    
    // 调用后端接口获取历史记录
    const historyData = await getChatHistoryApi(savedSessionId || undefined, 100)
    
    if (historyData && historyData.length > 0) {
      // 转换为前端消息格式
      const historyMessages = historyData.map(convertVOToMessage)
      messages.value = historyMessages
      
      // 保存会话ID
      if (historyData[0]?.sessionId) {
        currentSessionId.value = historyData[0].sessionId
        localStorage.setItem(SESSION_STORAGE_KEY, historyData[0].sessionId)
      }
      
      console.log(`成功加载 ${historyMessages.length} 条历史消息`)
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      return true
    } else {
      console.log('没有找到历史消息，使用默认欢迎消息')
      return false
    }
  } catch (error) {
    console.warn('从服务器加载聊天历史失败:', error)
    ElMessage({
      message: '加载聊天历史失败，将显示本地缓存',
      type: 'warning',
      duration: 3000
    })
    return false
  } finally {
    isLoadingHistory.value = false
  }
}

// 加载本地保存的消息（作为备用方案）
const loadMessagesFromStorage = () => {
  try {
    const savedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        messages.value = parsedMessages
        console.log(`从本地存储加载 ${parsedMessages.length} 条消息`)
        return true
      }
    }
  } catch (error) {
    console.warn('加载本地消息失败:', error)
  }
  return false
}

// 设置默认欢迎消息
const setDefaultWelcomeMessage = () => {
  messages.value = [{
    role: 'assistant',
    content: '你好！我是AI助手，请问有什么可以帮助你的吗？'
  }]
}

// 保存消息到本地存储
const saveMessagesToStorage = () => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages.value))
    if (currentSessionId.value) {
      localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId.value)
    }
  } catch (error) {
    console.warn('保存消息到本地存储失败:', error)
  }
}

// 监听消息变化，自动保存
watch(messages, () => {
  saveMessagesToStorage()
}, { deep: true })

// 定期自动保存
setInterval(saveMessagesToStorage, AUTO_SAVE_INTERVAL)

// 处理知识库选择变化
const handleKnowledgeBaseChange = (kbs: KnowledgeBase[]) => {
  selectedKnowledgeBaseDetails.value = kbs
}

// 处理普通对话
const handleSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  await sendMessage(sendChatMessageApi)
}

// 处理RAG对话
const handleRagSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  if (selectedKnowledgeBases.value.length === 0) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  await sendRagMessage(userInput.value.trim(), selectedKnowledgeBases.value)
}

// 发送RAG消息的专用方法
const sendRagMessage = async (message: string, knowledgeBaseIds: number[]) => {
  if (!message.trim() || isLoading.value) return

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: message.trim()
  }
  messages.value.push(userMessage)

  userInput.value = ''
  isLoading.value = true

  // 添加AI消息占位符
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    isTyping: true
  }
  messages.value.push(assistantMessage)

  // 消息备份，用于错误恢复
  let accumulatedContent = ''
  let retryCount = 0
  const maxRetries = 3

  const processRagStream = async (): Promise<void> => {
    try {
      console.log('发送RAG请求，知识库ID:', knowledgeBaseIds)
      
      // 使用新的RAG API函数
      const response = await sendRagChatMessageWithKnowledgeBasesApi(message, knowledgeBaseIds)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('RAG API错误:', errorText)
        throw new Error(`网络请求失败: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应数据流')
      }

      const decoder = new TextDecoder('utf-8')
      assistantMessage.content = '' // 清空占位符文本
      let buffer = '' // 用于处理跨chunk的数据
      let lastUpdateTime = Date.now()

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            console.log('RAG流式响应完成，总内容长度:', accumulatedContent.length)
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // 按行分割处理
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一行（可能不完整）
          
          // 处理完整的行
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const content = trimmedLine.substring(5).trim()
              if (content && content !== '[DONE]' && content !== 'null') {
                try {
                  // 尝试解析JSON格式的数据
                  const parsedContent = content.startsWith('{') ? JSON.parse(content).content || content : content
                  assistantMessage.content += parsedContent
                  accumulatedContent += parsedContent
                } catch (parseError) {
                  // 如果不是JSON，直接添加内容
                  assistantMessage.content += content
                  accumulatedContent += content
                }
              }
            }
          }
          
          // 定期更新UI（避免过于频繁的DOM更新）
          const now = Date.now()
          if (now - lastUpdateTime > 50) { // 每50ms最多更新一次
            await nextTick()
            scrollToBottom()
            lastUpdateTime = now
          }
        }
        
        // 处理剩余的buffer
        if (buffer.trim().startsWith('data:')) {
          const content = buffer.trim().substring(5).trim()
          if (content && content !== '[DONE]' && content !== 'null') {
            try {
              const parsedContent = content.startsWith('{') ? JSON.parse(content).content || content : content
              assistantMessage.content += parsedContent
              accumulatedContent += parsedContent
            } catch (parseError) {
              assistantMessage.content += content
              accumulatedContent += content
            }
          }
        }

      } finally {
        reader.releaseLock()
      }

    } catch (error: unknown) {
      console.error('RAG流式处理错误:', error)
      
      // 重试机制
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : 'UnknownError'
      
      if (retryCount < maxRetries && (errorName === 'NetworkError' || errorMessage.includes('网络'))) {
        retryCount++
        console.log(`网络错误，正在重试 (${retryCount}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // 递增延迟
        return processRagStream()
      }
      
      // 如果有部分内容，保留它
      if (accumulatedContent) {
        assistantMessage.content = accumulatedContent + '\n\n[连接中断，部分内容可能丢失]'
      } else {
        assistantMessage.content = `抱歉，发生了错误：${errorMessage}`
      }
      throw error
    }
  }

  try {
    await processRagStream()
    
    // 确保最终内容不为空
    if (!assistantMessage.content.trim()) {
      assistantMessage.content = '抱歉，没有收到有效的响应内容。'
    }
    
  } catch (error) {
    console.error('RAG消息发送失败:', error)
    // 错误已在processRagStream中处理
  } finally {
    isLoading.value = false
    assistantMessage.isTyping = false
    
    // 最终更新UI
    await nextTick()
    scrollToBottom()
    
    console.log('RAG消息处理完成，最终内容长度:', assistantMessage.content.length)
  }
}

// 发送消息通用方法
const sendMessage = async (apiMethod: (message: string) => Promise<Response>) => {
  if (!userInput.value.trim() || isLoading.value) return

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: userInput.value.trim()
  }
  messages.value.push(userMessage)

  const currentInput = userInput.value.trim()
  userInput.value = ''
  isLoading.value = true

  // 添加AI消息占位符
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    isTyping: true
  }
  messages.value.push(assistantMessage)

  // 消息备份，用于错误恢复
  let accumulatedContent = ''
  let retryCount = 0
  const maxRetries = 3

  const processStream = async (): Promise<void> => {
    try {
      // 构建请求URL，包含会话ID
      const baseUrl = apiMethod === sendChatMessageApi ? ChatApi.Chat : ChatApi.RagChat
      const params = new URLSearchParams()
      params.append('message', currentInput)
      
      // 如果有当前会话ID，添加到请求参数中
      if (currentSessionId.value) {
        params.append('sessionId', currentSessionId.value)
      }
      
      const url = `${BASE_URL}${baseUrl}?${params.toString()}`
      
      console.log('发送请求到:', url)
      
      // 使用fetch处理流式响应
      const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API错误:', errorText)
        throw new Error(`网络请求失败: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应数据流')
      }

      const decoder = new TextDecoder('utf-8')
      assistantMessage.content = '' // 清空占位符文本
      let buffer = '' // 用于处理跨chunk的数据
      let lastUpdateTime = Date.now()

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            console.log('流式响应完成，总内容长度:', accumulatedContent.length)
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // 按行分割处理
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一行（可能不完整）
          
          // 处理完整的行
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const content = trimmedLine.substring(5).trim()
              if (content && content !== '[DONE]' && content !== 'null') {
                try {
                  // 尝试解析JSON格式的数据
                  const parsedContent = content.startsWith('{') ? JSON.parse(content).content || content : content
                  assistantMessage.content += parsedContent
                  accumulatedContent += parsedContent
                } catch (parseError) {
                  // 如果不是JSON，直接添加内容
                  assistantMessage.content += content
                  accumulatedContent += content
                }
              }
            }
          }
          
          // 定期更新UI（避免过于频繁的DOM更新）
          const now = Date.now()
          if (now - lastUpdateTime > 50) { // 每50ms最多更新一次
            await nextTick()
            scrollToBottom()
            lastUpdateTime = now
          }
        }
        
        // 处理剩余的buffer
        if (buffer.trim().startsWith('data:')) {
          const content = buffer.trim().substring(5).trim()
          if (content && content !== '[DONE]' && content !== 'null') {
            try {
              const parsedContent = content.startsWith('{') ? JSON.parse(content).content || content : content
              assistantMessage.content += parsedContent
              accumulatedContent += parsedContent
            } catch (parseError) {
              assistantMessage.content += content
              accumulatedContent += content
            }
          }
        }

      } finally {
        reader.releaseLock()
      }

    } catch (error: unknown) {
      console.error('流式处理错误:', error)
      
      // 重试机制
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : 'UnknownError'
      
      if (retryCount < maxRetries && (errorName === 'NetworkError' || errorMessage.includes('网络'))) {
        retryCount++
        console.log(`网络错误，正在重试 (${retryCount}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // 递增延迟
        return processStream()
      }
      
      // 如果有部分内容，保留它
      if (accumulatedContent) {
        assistantMessage.content = accumulatedContent + '\n\n[连接中断，部分内容可能丢失]'
      } else {
        assistantMessage.content = `抱歉，发生了错误：${errorMessage}`
      }
      throw error
    }
  }

  try {
    await processStream()
    
    // 确保最终内容不为空
    if (!assistantMessage.content.trim()) {
      assistantMessage.content = '抱歉，没有收到有效的响应内容。'
    }
    
  } catch (error) {
    console.error('消息发送失败:', error)
    // 错误已在processStream中处理
  } finally {
    isLoading.value = false
    assistantMessage.isTyping = false
    
    // 最终更新UI
    await nextTick()
    scrollToBottom()
    
    console.log('消息处理完成，最终内容长度:', assistantMessage.content.length)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 复制消息
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage({
      message: '复制成功',
      type: 'success',
      duration: 2000
    })
  } catch (err) {
    ElMessage({
      message: '复制失败',
      type: 'error',
      duration: 2000
    })
  }
}

// 手动刷新历史记录
const refreshHistory = async () => {
  console.log('手动刷新聊天历史...')
  const historyLoaded = await loadChatHistoryFromServer()
  
  if (historyLoaded) {
    ElMessage({
      message: '历史记录刷新成功',
      type: 'success',
      duration: 2000
    })
  } else {
    ElMessage({
      message: '暂无历史记录',
      type: 'info',
      duration: 2000
    })
  }
}

// 清空对话
const clearMessages = () => {
  messages.value = [{
    role: 'assistant',
    content: '你好！我是AI助手，请问有什么可以帮助你的吗？'
  }]
  
  // 清空本地存储和会话信息
  localStorage.removeItem(MESSAGES_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
  currentSessionId.value = null
  
  ElMessage({
    message: '对话已清空',
    type: 'success',
    duration: 2000
  })
}

// Markdown渲染
const renderMarkdown = (content: string) => {
  try {
    return marked(content, {
      breaks: true,
      gfm: true
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return content
  }
}

onMounted(async () => {
  console.log('RAG聊天组件初始化...')
  
  // 优先尝试从服务器加载聊天历史
  const serverHistoryLoaded = await loadChatHistoryFromServer()
  
  if (!serverHistoryLoaded) {
    // 如果服务器没有历史记录，尝试加载本地缓存
    const localHistoryLoaded = loadMessagesFromStorage()
    
    if (!localHistoryLoaded) {
      // 如果本地也没有，设置默认欢迎消息
      setDefaultWelcomeMessage()
    }
  }
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
})
</script>

<style scoped lang="less">
.chat-container {
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;

  .box-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }
  }
}

.knowledge-base-selection {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  
  .selection-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    
    h4 {
      margin: 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
    
    .el-icon {
      color: #909399;
      cursor: help;
    }
  }
}

.loading-history {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  gap: 8px;
  
  .el-icon {
    font-size: 16px;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f0f2f5;
  }
}

.message {
  margin-bottom: 15px;
  max-width: 80%;

  &.user-message {
    margin-left: auto;
    text-align: right;

    .message-wrapper {
      flex-direction: row-reverse;
      justify-content: flex-start;
    }

    .message-content {
      background-color: #007AFF;
      color: white;
    }
  }

  &.assistant-message {
    margin-right: auto;
    text-align: left;
  }
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #f0f0f0;
  word-break: break-word;
  font-size: 14px;

  :deep(p) {
    margin: 0;
    line-height: 1.5;
  }

  :deep(pre) {
    background-color: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 13px;
  }

  :deep(code) {
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    background-color: #f8f8f8;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 13px;
  }

  :deep(ul), :deep(ol) {
    padding-left: 20px;
    margin: 8px 0;
  }

  :deep(blockquote) {
    margin: 8px 0;
    padding-left: 10px;
    border-left: 4px solid #ddd;
    color: #666;
  }

  &.typing {
    &::after {
      content: '...';
      animation: ellipsis 1.5s infinite;
    }
  }
}

@keyframes ellipsis {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: '.'; }
}

.copy-button {
  opacity: 0;
  transition: opacity 0.3s;
  padding: 4px;
  height: auto;

  &:hover {
    opacity: 1;
  }
}

.input-container {
  margin-top: auto;
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  min-height: 100px;

  .el-textarea {
    flex: 1;
  }
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 0;

  .el-button {
    width: 120px;
    height: 40px;
    font-size: 14px;
  }
}
</style>
