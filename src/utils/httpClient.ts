// HTTP客户端工具类，统一处理JWT认证
import { ElMessage } from 'element-plus'
import router from '@/router'

export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response): Promise<Response> {
    if (response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      
      // 显示提示信息
      ElMessage.error("登录已过期，请重新登录");
      
      // 跳转到登录页面
      router.push("/login");
      
      throw new Error('Unauthorized');
    }
    
    return response;
  }

  async get(url: string, params?: Record<string, string>): Promise<Response> {
    let fullUrl = `${this.baseURL}${url}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async post(url: string, data?: any): Promise<Response> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse(response);
  }

  async put(url: string, data?: any): Promise<Response> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse(response);
  }

  async delete(url: string): Promise<Response> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }
}

// 创建默认的HTTP客户端实例
import { BASE_URL } from '@/http/config';
export const httpClient = new HttpClient(BASE_URL);