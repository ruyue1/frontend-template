/**
 * 后端资源键契约的集中声明。
 * 用户是否拥有某项资源始终以 AuthProvider 从接口获取的结果为准。
 */
export const RESOURCES = {
  SYSTEM: {
    AUTHORIZATION_MANAGEMENT: 'system_authorization_management',
  },
} as const;
