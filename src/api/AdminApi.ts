/**
 * 系统管理 API 接口
 * 
 * @author yunzhongxiaoma
 * @since 1.0.0
 */

import service from '@/http'
import type { ApiResponse } from './data'

/**
 * 修复知识库文件计数
 * 同步知识库表中的file_count字段与实际文件数量
 */
export const fixKnowledgeBaseFileCountApi = (): Promise<ApiResponse<string>> => {
  return service.post('/admin/fix-knowledge-base-file-count')
}