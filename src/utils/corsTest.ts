// CORS测试工具
import { BASE_URL } from '@/http/config';

export const testCorsConfiguration = async () => {
  console.log('=== CORS配置测试开始 ===');
  
  try {
    // 1. 测试简单的GET请求
    console.log('1. 测试GET请求...');
    const getResponse = await fetch(`${BASE_URL}/test/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET请求成功:', data);
    } else {
      console.error('❌ GET请求失败:', getResponse.status, getResponse.statusText);
    }
    
    // 2. 测试POST请求（会触发预检请求）
    console.log('2. 测试POST请求...');
    const postResponse = await fetch(`${BASE_URL}/test/cors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('✅ POST请求成功:', data);
    } else {
      console.error('❌ POST请求失败:', postResponse.status, postResponse.statusText);
    }
    
    // 3. 测试登录请求
    console.log('3. 测试登录请求格式...');
    const loginResponse = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'userName=test&password=test'
    });
    
    console.log('登录请求状态:', loginResponse.status);
    if (loginResponse.status === 401) {
      console.log('✅ 登录请求格式正确（401是预期的，因为用户不存在）');
    } else if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('✅ 登录请求成功:', data);
    } else {
      console.error('❌ 登录请求失败:', loginResponse.status, loginResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ CORS测试过程中发生错误:', error);
  }
  
  console.log('=== CORS配置测试完成 ===');
};

// 在浏览器控制台中可以调用的测试函数
(window as any).testCors = testCorsConfiguration;