import axios from "axios";
import { BASE_URL, HEADER } from "./config";
import { ElMessage } from "element-plus";
import router from "@/router";

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: HEADER,
});

// 创建请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("发送请求，token:", token); // 调试信息
    if (token !== null) {
      config.headers.Authorization = "Bearer " + token;
      console.log("设置Authorization头:", config.headers.Authorization); // 调试信息
    }
    return config;
  },
  (error) => {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }
);

// 创建响应拦截器
service.interceptors.response.use(
  (res: any) => {
    return res.data;
  },
  (error) => {
    console.error("响应拦截器错误:", error);
    
    let message = "";
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        message = "登录已过期，请重新登录";
        // 清除本地存储的认证信息
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        
        // 显示提示信息
        ElMessage.error(message);
        
        // 跳转到登录页面
        router.push("/login");
        break;
        
      case 403:
        message = "权限不足，无法访问";
        ElMessage.error(message);
        break;
        
      case 404:
        message = "请求的资源不存在";
        ElMessage.error(message);
        break;
        
      case 500:
        message = "服务器内部错误";
        ElMessage.error(message);
        break;
        
      default:
        message = error.response?.data?.message || error.message || "请求失败";
        ElMessage.error(message);
        break;
    }
    
    return Promise.reject(error);
  }
);

export default service;
