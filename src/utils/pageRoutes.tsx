import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { PageRouteDefinition } from '@/typings/routes';

// 使用 Vite 的 import.meta.glob 预扫描所有页面（编译时静态分析）。
const pageModules = import.meta.glob([
  '@/pages/**/index.tsx',
  '!@/pages/System/**/index.tsx',
  '!@/pages/Login/**/index.tsx',
  '!@/pages/Logout/**/index.tsx',
]) as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;
const systemPageModules = import.meta.glob('@/pages/System/**/index.tsx') as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

function resolvePageModule(pageKey: string, isSystemMenu?: boolean) {
  const isSystemPage = isSystemMenu || pageKey.startsWith('System/');
  const modules = isSystemPage ? systemPageModules : pageModules;
  const normalizedKey = pageKey.replace(/^\//, '').replace(/\/$/, '');
  const importPath = isSystemPage
    ? `/src/pages/System/${normalizedKey.replace(/^System\//, '')}/index.tsx`
    : `/src/pages/${normalizedKey}/index.tsx`;
  return modules[importPath];
}

/** 从统一业务配置生成 React Router 路由；无 path 的目录不会生成独立路由。 */
export function createPageRoutes(items: PageRouteDefinition[], isSystemMenu?: boolean): RouteObject[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const result: RouteObject[] = [];
  for (const item of items) {
    if (!item.path && item.children) {
      result.push(...createPageRoutes(item.children, isSystemMenu));
      continue;
    }

    const route: RouteObject = { path: item.path };
    if (item.pageKey) {
      const loader = resolvePageModule(item.pageKey, isSystemMenu);
      if (!loader) throw new Error(`未找到页面模块：${item.pageKey}`);
      const Page = lazy(loader);
      route.element = <Suspense><Page /></Suspense>;
    }
    if (item.children?.length) route.children = createPageRoutes(item.children, isSystemMenu);
    result.push(route);
  }
  return result;
}
