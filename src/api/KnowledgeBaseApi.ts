/**
 * 知识库管理 API 接口
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import service from '@/http'
import type { ApiResponse, PageResponse } from './data'

export interface KnowledgeBase {
  id: number
  name: string
  displayName: string
  type: 'PERSONAL' | 'PUBLIC'
  creatorId: number
  description?: string
  fileCount: number
  vectorCollectionName?: string
  createTime: string
  updateTime: string
}

export interface CreateKnowledgeBaseDTO {
  displayName: string
  type: 'PERSONAL' | 'PUBLIC'
  description?: string
}

export interface UpdateKnowledgeBaseDTO {
  displayName?: string
  description?: string
}

export interface KnowledgeBaseQueryDTO {
  type?: 'PERSONAL' | 'PUBLIC'
  keyword?: string
  creatorId?: number
  page?: number
  size?: number
}

export interface QueryFileDTO {
  knowledgeBaseId: number
  fileName?: string
  fileType?: string
  page?: number
  size?: number
}

export interface KnowledgeBaseFile {
  id: number
  knowledgeBaseId: number
  fileName: string
  originalName: string
  fileUrl: string
  fileSize: number
  fileType: string
  vectorIds?: string
  uploadUserId: number
  createTime: string
  updateTime: string
}

// 获取知识库列表
export const getKnowledgeBasesApi = (type?: 'PERSONAL' | 'PUBLIC'): Promise<ApiResponse<KnowledgeBase[]>> => {
  return service.get('/knowledge-base', { params: { type } })
}

// 分页查询知识库
export const getKnowledgeBasesPageApi = (query: KnowledgeBaseQueryDTO): Promise<PageResponse<KnowledgeBase>> => {
  return service.get('/knowledge-base/page', { params: query })
}

// 获取可访问的知识库
export const getAccessibleKnowledgeBasesApi = (): Promise<ApiResponse<KnowledgeBase[]>> => {
  return service.get('/knowledge-base/accessible')
}

// 搜索知识库
export const searchKnowledgeBasesApi = (keyword: string): Promise<ApiResponse<KnowledgeBase[]>> => {
  return service.get('/knowledge-base/search', { params: { keyword } })
}

// 创建知识库
export const createKnowledgeBaseApi = (data: CreateKnowledgeBaseDTO): Promise<ApiResponse<KnowledgeBase>> => {
  return service.post('/knowledge-base', data)
}

// 更新知识库
export const updateKnowledgeBaseApi = (id: number, data: UpdateKnowledgeBaseDTO): Promise<ApiResponse<KnowledgeBase>> => {
  return service.put(`/knowledge-base/${id}`, data)
}

// 删除知识库
export const deleteKnowledgeBaseApi = (id: number): Promise<ApiResponse<void>> => {
  return service.delete(`/knowledge-base/${id}`)
}

// 上传文件到知识库
export const uploadFileToKnowledgeBaseApi = (id: number, file: File): Promise<ApiResponse<KnowledgeBaseFile>> => {
  const formData = new FormData()
  formData.append('file', file)
  return service.post(`/knowledge-base/${id}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取知识库文件列表
export const getKnowledgeBaseFilesApi = (id: number): Promise<ApiResponse<KnowledgeBaseFile[]>> => {
  return service.get(`/knowledge-base/${id}/files`)
}

// 分页查询知识库文件
export const getKnowledgeBaseFilesPageApi = (query: QueryFileDTO): Promise<PageResponse<KnowledgeBaseFile>> => {
  return service.get(`/knowledge-base/${query.knowledgeBaseId}/files/page`, { 
    params: query 
  })
}

// 删除知识库文件
export const deleteKnowledgeBaseFileApi = (fileId: number): Promise<ApiResponse<void>> => {
  return service.delete(`/knowledge-base/files/${fileId}`)
}

// 批量上传文件到知识库
export const batchUploadFilesToKnowledgeBaseApi = (id: number, files: File[]): Promise<ApiResponse<KnowledgeBaseFile[]>> => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append(`files`, file)
  })
  return service.post(`/knowledge-base/${id}/files/batch`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 批量删除知识库文件
export const batchDeleteKnowledgeBaseFilesApi = (fileIds: number[]): Promise<ApiResponse<void>> => {
  return service.delete('/knowledge-base/files/batch', {
    data: { fileIds }
  })
}