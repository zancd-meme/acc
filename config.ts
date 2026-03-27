/**
 * 全局项目配置文件
 * 用于统一管理环境地址、API 路径和其他全局常量。
 */

// 环境域名定义
const ENV_HOSTS = {
  // 测试环境
  TEST: 'https://xertest.nas.cpolar.cn',
  // 生产环境
  PROD: 'https://www.wenshidt.com'
};

// --- 当前环境设置 (在此处切换) ---
const CURRENT_HOST = ENV_HOSTS.TEST; 

export const APP_CONFIG = {
  // API 基础路径 (通常包含 /api 前缀)
  API_BASE_URL: `${CURRENT_HOST}/api`,
  
  // 其他全局配置
  TIMEOUT: 10000, // 请求超时时间 (ms)
};
