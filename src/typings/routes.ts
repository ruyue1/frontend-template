import type { Route } from '@/typings/workbench';

/**
 * 业务导航的唯一配置模型。
 * 继承 ProLayout 菜单字段，页面节点通过 pageKey 对应 src/pages/<pageKey>/index.tsx。
 */
export type PageRouteDefinition = Omit<Route, 'children' | 'key'> & {
  children?: PageRouteDefinition[];
  /** 页面目录键；省略时该节点仅作为目录或外链菜单。 */
  pageKey?: string;
  /** 预留给授权分支的页面或外链资源绑定。 */
  resourceKey?: string;
};
