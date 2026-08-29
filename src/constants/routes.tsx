import AuthorizationManagementPage from '@/pages/System/AuthorizationManagementPage';
import { RESOURCES } from '@/constants/resources';
import type { PageRouteDefinition } from '@/typings/routes';

// XCODEAGENT_BUSINESS_ROUTE_IMPORTS_START
// XCODEAGENT_BUSINESS_ROUTE_IMPORTS_END

/**
 * 页面路由、路由权限与菜单入口的唯一配置来源。
 * 后续业务页面请在 XCODEAGENT_BUSINESS_ROUTES 标记之间追加配置。
 */
export const PAGE_ROUTES: PageRouteDefinition[] = [
  {
    path: '/authorization-management',
    resourceKey: RESOURCES.SYSTEM.AUTHORIZATION_MANAGEMENT,
    menu: {
      key: 'authorization-management',
      label: '权限管理',
      icon: 'SafetyCertificateOutlined',
    },
    element: <AuthorizationManagementPage />,
  },
  // XCODEAGENT_BUSINESS_ROUTES_START
  // XCODEAGENT_BUSINESS_ROUTES_END
];
