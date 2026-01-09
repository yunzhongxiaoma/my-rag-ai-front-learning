/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 分页响应类型
 */
export interface PageResponse<T = any> {
  code: number
  message: string
  data: {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
  }
}

export interface StoreFile {
  id: number;
  url: string;
  fileName: string;
  vectorId: string[];
  createTime: Date;
  updateTime: Date;
}
