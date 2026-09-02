import type { PageRouteDefinition } from '@/typings/routes';

/** 业务路由根路径；业务页面 URL 始终以 /page 开头。 */
export const PAGE_ROUTE = 'page';

/**
 * 页面路由与菜单入口的唯一配置来源。
 * 后续业务页面请在 XCODEAGENT_BUSINESS_ROUTES 标记之间追加配置。
 */
export const PAGE_ROUTES: PageRouteDefinition[] = [
  // XCODEAGENT_BUSINESS_ROUTES_START
  {
    path: 'firstLevel',
    name: '一级目录',
    icon: 'https://cmbjs.paas.cmbchina.cn/documents/documentIcon/ant-design.png',
    children: [
      {
        path: 'default',
        name: '默认页面',
        pageKey: 'DefaultPage',
      },
    ],
  },
  // XCODEAGENT_BUSINESS_ROUTES_END
];
