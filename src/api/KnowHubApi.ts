import { KnowApi } from "./common";
import { BASE_URL } from "@/http/config";
import axios from "axios";
import { DownloadFileDto,DeleteFileDto, QueryFileDto } from "./dto";
import service from "@/http";
import { ElMessage } from "element-plus";
import router from "@/router";

type Res = any;

const fileService = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// 添加请求拦截器来处理JWT token
fileService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器来处理401错误
fileService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("文件服务响应错误:", error);
    
    const status = error.response?.status;
    
    if (status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      
      // 显示提示信息
      ElMessage.error("登录已过期，请重新登录");
      
      // 跳转到登录页面
      router.push("/login");
    }
    
    return Promise.reject(error);
  }
);

// 上传知识库接口
export const uploadFileApi = async (filesList: File[]): Promise<Res> => {
  let formData = new FormData();
  filesList.map((e) => {
    formData.append("file", e);
  });

  return fileService.post(KnowApi.UploadFile, formData);
};

// 查询所有知识库接口
export const queryFileApi = async (params: QueryFileDto): Promise<Res> => {
  console.log("请求参数：", params);

  return service.get(KnowApi.QueryFile, {
    params,
  });
};

// 删除指定ID列表的知识库
export const deleteFileApi = async (params: DeleteFileDto): Promise<Res> => {
  return service.delete(KnowApi.DeleteFile, {
    params,
  });
};

// 下载指定ID列表的知识库
export const downloadFileApi = async (params: DownloadFileDto): Promise<Res> => {
  return service.get(KnowApi.DownloadFile, {
    params,
  });
};
