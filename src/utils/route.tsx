import type { RouteObject } from 'react-router-dom';
import { RouteGuard } from '@/components/authorization/RouteGuard';
import type { Route } from '@/typings/workbench';
import type { PageRouteDefinition } from '@/typings/routes';

export function createProtectedRoutes(items: PageRouteDefinition[]): RouteObject[] {
  return items.map((item) => ({
    path: item.path,
    element: <RouteGuard resourceKey={item.resourceKey}>{item.element}</RouteGuard>,
  }));
}

export function createAuthorizedMenus(
  hasPermission: (resourceKey: string) => boolean,
  items: PageRouteDefinition[],
): Route[] {
  return items.flatMap((item) => {
    if (!item.menu || !hasPermission(item.resourceKey)) return [];
    return [{
      key: item.menu.key,
      name: item.menu.label,
      icon: item.menu.icon,
      path: item.path,
    }];
  });
}

export function findFirstAuthorizedMenuPath(
  hasPermission: (resourceKey: string) => boolean,
  items: PageRouteDefinition[],
): string | undefined {
  return items.find((item) => item.menu && hasPermission(item.resourceKey))?.path;
}
