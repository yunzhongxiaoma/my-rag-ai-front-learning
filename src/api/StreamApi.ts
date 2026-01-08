import { fetchEventSource } from "@microsoft/fetch-event-source";
import { BASE_URL } from "@/http/config.ts";
import { ElMessage } from "element-plus";
import router from "@/router";

class FatalError extends Error {}
class RetriableError extends Error {}

type ResultCallBack = (e: any | null) => void;

const BaseUrl = BASE_URL;

// 获取认证头的工具函数
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// 处理401错误的工具函数
const handle401Error = () => {
  // 清除本地存储的认证信息
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  
  // 显示提示信息
  ElMessage.error("登录已过期，请重新登录");
  
  // 跳转到登录页面
  router.push("/login");
};

export const postStreamChat = (
    author: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
    const ctrl = new AbortController();
    
    fetchEventSource(BaseUrl + "/post-chat", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            author: author,
        }),
        signal: ctrl.signal,
        onmessage: onMessage,
        onerror: (err: any) => {
            onError(err);
        },
        onclose: () => {
            onClose(null);
        },
        onopen: async (response: any) => {
            if (response.ok) {
                return;
            } else if (response.status === 401) {
                handle401Error();
                throw new FatalError();
            } else if (
                response.status >= 400 &&
                response.status < 500 &&
                response.status !== 429
            ) {
                throw new FatalError();
            } else {
                throw new RetriableError();
            }
        },
    });
};

export const getStreamChat = (
    message: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
    const ctrl = new AbortController();
    
    fetchEventSource(BaseUrl + "/chat/stream?message=" + message, {
        method: "GET",
        headers: getAuthHeaders(),
        body: null,
        signal: ctrl.signal,
        onmessage: onMessage,
        onerror: (err: any) => {
            onError(err);
        },
        onclose: () => {
            onClose(null);
        },
        onopen: async (response: any) => {
            if (response.ok) {
                return;
            } else if (response.status === 401) {
                handle401Error();
                throw new FatalError();
            } else if (
                response.status >= 400 &&
                response.status < 500 &&
                response.status !== 429
            ) {
                throw new FatalError();
            } else {
                throw new RetriableError();
            }
        },
    });
};