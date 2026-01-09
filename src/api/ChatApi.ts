import { httpClient } from "@/utils/httpClient";
import { fetchWithAuthJSON } from "@/utils/fetchWrapper";

export const ChatApi = {
  Chat: "/chat/stream",
  RagChat: "/ai/rag",
  History: "/chat/history",
  Sessions: "/chat/session/list",
};

// 聊天消息接口
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  id?: string;
  createTime?: string;
  messageType?: string;
}

// 后端返回的消息VO接口
export interface ChatMessageVO {
  id: string;
  sessionId: string;
  userId: number;
  messageType: 'USER' | 'ASSISTANT';
  content: string;
  metadata?: string;
  createTime: string;
}

// 会话信息接口
export interface ChatSessionVO {
  sessionId: string;
  title: string;
  status: number; // 1-活跃，0-已结束
  messageCount: number;
  lastMessageTime: string;
  createTime: string;
  recentMessages?: ChatMessageVO[];
}

// API响应接口
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 发送消息接口
export const sendChatMessageApi = async (message: string): Promise<Response> => {
  return httpClient.get(ChatApi.Chat, { message });
};

// 发送RAG消息接口
export const sendRagChatMessageApi = async (message: string): Promise<Response> => {
  return httpClient.get(ChatApi.RagChat, { message });
};

// 获取聊天历史记录
export const getChatHistoryApi = async (sessionId?: string, limit: number = 50): Promise<ChatMessageVO[]> => {
  const params = new URLSearchParams();
  if (sessionId) {
    params.append('sessionId', sessionId);
  }
  params.append('limit', limit.toString());
  
  const url = `/api/v1${ChatApi.History}?${params.toString()}`;
  const response = await fetchWithAuthJSON(url);
  
  if (response.code === 0) {
    return response.data || [];
  } else {
    throw new Error(response.message || '获取聊天历史失败');
  }
};

// 获取会话列表
export const getChatSessionsApi = async (): Promise<ChatSessionVO[]> => {
  const url = `/api/v1${ChatApi.Sessions}`;
  const response = await fetchWithAuthJSON(url);
  
  if (response.code === 0) {
    return response.data || [];
  } else {
    throw new Error(response.message || '获取会话列表失败');
  }
};
