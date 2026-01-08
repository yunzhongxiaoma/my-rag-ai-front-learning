import { httpClient } from "@/utils/httpClient";

export const ChatApi = {
  Chat: "/chat/stream",
  RagChat: "/ai/rag",
};

// 聊天消息接口
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

// 发送消息接口
export const sendChatMessageApi = async (message: string): Promise<Response> => {
  return httpClient.get(ChatApi.Chat, { message });
};

// 发送RAG消息接口
export const sendRagChatMessageApi = async (message: string): Promise<Response> => {
  return httpClient.get(ChatApi.RagChat, { message });
};
