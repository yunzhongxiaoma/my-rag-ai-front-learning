// JWT认证测试工具
import { httpClient } from './httpClient';

export const testJWTAuth = async () => {
  console.log('=== JWT认证测试开始 ===');
  
  // 1. 检查token是否存在
  const token = localStorage.getItem('token');
  console.log('1. 本地存储的token:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    console.error('❌ 没有找到JWT token，请先登录');
    return false;
  }
  
  // 2. 测试普通API调用
  try {
    console.log('2. 测试普通API调用...');
    const response = await httpClient.get('/user/info');
    console.log('普通API响应状态:', response.status);
    
    if (response.status === 401) {
      console.error('❌ JWT认证失败 - 401 Unauthorized');
      return false;
    } else if (response.ok) {
      console.log('✅ 普通API认证成功');
    }
  } catch (error) {
    console.error('❌ 普通API调用失败:', error);
  }
  
  // 3. 测试聊天流式接口
  try {
    console.log('3. 测试聊天流式接口...');
    const chatResponse = await httpClient.get('/chat/stream', { message: '测试消息' });
    console.log('聊天接口响应状态:', chatResponse.status);
    
    if (chatResponse.status === 401) {
      console.error('❌ 聊天接口JWT认证失败 - 401 Unauthorized');
      return false;
    } else if (chatResponse.ok) {
      console.log('✅ 聊天接口认证成功');
    }
  } catch (error) {
    console.error('❌ 聊天接口调用失败:', error);
  }
  
  console.log('=== JWT认证测试完成 ===');
  return true;
};

// 在浏览器控制台中可以调用的测试函数
(window as any).testJWT = testJWTAuth;