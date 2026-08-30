import type { ReactNode } from 'react';

/** 页面路由与菜单的统一配置类型。 */
export type PageMenu = {
  key: string;
  label: string;
  icon?: string;
};

/**
 * 每个页面只能在此配置中注册一次。
 * 未设置 resourceKey 的页面不参与前端业务权限控制。
 * 未设置 menu 的页面不会显示在导航菜单中。
 */
export type PageRouteDefinition = {
  path: string;
  resourceKey?: string;
  element: ReactNode;
  menu?: PageMenu;
};
