import { ElMessage } from 'element-plus'
import router from '@/router'

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

// 包装fetch函数，自动处理401错误
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 自动添加认证头
  const token = localStorage.getItem('token');
  if (token && !options.headers) {
    options.headers = {};
  }
  
  if (token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, options);
    
    // 检查401错误
    if (response.status === 401) {
      handle401Error();
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    // 如果是网络错误或其他错误，直接抛出
    throw error;
  }
};

// 便捷方法
export const fetchWithAuthJSON = async (url: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetchWithAuth(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};