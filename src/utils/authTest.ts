// JWT认证测试工具
import { httpClient } from './httpClient';
import { fetchWithAuthJSON } from './fetchWrapper';
import { BASE_URL } from '@/http/config';

export const testJWTAuth = async () => {
  console.log('=== JWT认证测试开始 ===');
  
  // 1. 检查token是否存在
  const token = localStorage.getItem('token');
  console.log('1. 本地存储的token:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.error('❌ 没有找到JWT token，请先登录');
    return false;
  }
  
  try {
    // 2. 测试普通API请求
    console.log('2. 测试普通API请求...');
    const response = await httpClient.get('/user/1');
    
    if (response.status === 401) {
      console.error('❌ JWT认证失败 - 401 Unauthorized');
      return false;
    } else if (response.ok) {
      console.log('✅ 普通API请求成功');
    }
    
    // 3. 测试知识库API
    console.log('3. 测试知识库API...');
    const chatResponse = await fetchWithAuthJSON(`${BASE_URL}/knowledge/contents?page=0&pageSize=10`);
    
    if (chatResponse) {
      console.log('✅ 知识库API请求成功');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return false;
  }
  
  console.log('=== JWT认证测试完成 ===');
  return true;
};

// 测试过期token处理
export const testExpiredToken = async () => {
  console.log('=== 过期Token测试开始 ===');
  
  // 设置一个明显过期的token
  const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTYwOTQ1OTIwMH0.expired';
  localStorage.setItem('token', expiredToken);
  
  try {
    // 尝试请求需要认证的接口
    await fetchWithAuthJSON(`${BASE_URL}/knowledge/contents?page=0&pageSize=10`);
    console.log('❌ 过期token测试失败 - 应该跳转到登录页');
    return false;
  } catch (error) {
    console.log('✅ 过期token正确处理 - 已跳转到登录页');
    return true;
  }
};

// 在浏览器控制台中可以调用的测试函数
(window as any).testJWT = testJWTAuth;
(window as any).testExpiredToken = testExpiredToken;