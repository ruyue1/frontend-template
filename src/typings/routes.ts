import type { Route } from '@/typings/workbench';

/** 页面路由与菜单的统一配置类型。 */
export type PageMenu = {
  key: string;
  label: string;
  icon?: string;
};

/**
 * 根数组中的页面节点即为扁平菜单；children 用于目录层级。
 */
export type PageRouteDefinition = Omit<Route, 'children' | 'key'> & {
  children?: PageRouteDefinition[];
  /** XcodeAgent 业务页标识；用于确定页面目录和路由地址。 */
  pageId?: string;
  /** 平台系统页的显式模块目录，不适用 pageId 业务页转换规则。 */
  modulePath?: string;
  resourceKey?: string;
  menu?: PageMenu;
};
