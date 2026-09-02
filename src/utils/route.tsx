import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { Route } from '@typings/workbench';

// 使用 Vite 的 import.meta.glob 预扫描所有页面（编译时静态分析）
const pageModules = import.meta.glob('@/pages/**/index.tsx') as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;
const systemPageModules = import.meta.glob('@/pages/System/**/index.tsx') as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

function resolvePageModule(menuKey: string, isSystemMenu?: boolean) {
  const modules = isSystemMenu ? systemPageModules : pageModules;
  const normalizedKey = menuKey.replace(/^\//, '').replace(/\/$/, '');
  const importPath = isSystemMenu
    ? `/src/pages/System/${normalizedKey}/index.tsx`
    : `/src/pages/${normalizedKey}/index.tsx`;
  return modules[importPath];
}

export function transformMenuToRoute(menus: Route[], isSystemMenu?: boolean): RouteObject[] {
  if (!Array.isArray(menus) || menus.length === 0) return [];

  const result: RouteObject[] = [];

  for (const menu of menus) {
    if (!menu?.path && menu?.children) {
      const childRoutes = transformMenuToRoute(menu.children, isSystemMenu);
      result.push(...childRoutes);
      continue;
    }

    const route: RouteObject = {
      path: menu.path,
    };

    if (menu?.key) {
      const loader = resolvePageModule(menu.key, isSystemMenu);
      if (loader) {
        const Page = lazy(loader);
        route.element = <Page />;
      }
    }

    if (menu?.children && menu?.children.length > 0) {
      route.children = transformMenuToRoute(menu.children, isSystemMenu);
    }

    result.push(route);
  }

  return result;
}
