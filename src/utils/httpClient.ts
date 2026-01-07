// HTTP客户端工具类，统一处理JWT认证
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

  async get(url: string, params?: Record<string, string>): Promise<Response> {
    let fullUrl = `${this.baseURL}${url}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    return fetch(fullUrl, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async post(url: string, data?: any): Promise<Response> {
    return fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any): Promise<Response> {
    return fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string): Promise<Response> {
    return fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }
}

// 创建默认的HTTP客户端实例
import { BASE_URL } from '@/http/config';
export const httpClient = new HttpClient(BASE_URL);