import type { Route } from '@/typings/workbench';
import type { PageRouteDefinition } from '@/typings/routes';
import { pageRouteSegmentFromId } from '@/utils/pageIdentity';

function normalizePathSegment(path?: string) {
  return path?.replace(/^\/+|\/+$/g, '') ?? '';
}

function toInternalPath(rootPath: string, pathSegments: string[]) {
  return `/${[normalizePathSegment(rootPath), ...pathSegments].join('/')}`;
}

/** auth 专有权限层：递归过滤菜单，并仅保留存在可访问后代的目录。 */
export function createAuthorizedMenus(
  hasPermission: (resourceKey: string) => boolean,
  items: PageRouteDefinition[],
  rootPath: string,
): Route[] {
  const walk = (nodes: PageRouteDefinition[], parentSegments: string[]): Route[] => nodes.flatMap((item) => {
    const normalizedPath = item.pageId
      ? pageRouteSegmentFromId(item.pageId)
      : normalizePathSegment(item.path);
    const internalPathSegments = normalizedPath && !item.isUrl
      ? [...parentSegments, normalizedPath]
      : parentSegments;
    const children = item.children?.length ? walk(item.children, internalPathSegments) : [];
    const permitted = !item.resourceKey || hasPermission(item.resourceKey);
    if (!item.menu) return children;
    if (!permitted && children.length === 0) return [];

    return [{
      key: item.menu.key,
      name: item.menu.label,
      icon: item.menu.icon,
      path: item.isUrl
        ? (permitted ? item.path : undefined)
        : (item.pageId || item.modulePath) && permitted && normalizedPath
          ? toInternalPath(rootPath, internalPathSegments)
          : undefined,
      isUrl: item.isUrl,
      target: item.target,
      children: children.length ? children : undefined,
    }];
  });

  return Array.isArray(items) ? walk(items, []) : [];
}

/** 返回第一个有权限的内部页面，用于 /page 入口重定向。 */
export function findFirstAuthorizedMenuPath(
  hasPermission: (resourceKey: string) => boolean,
  items: PageRouteDefinition[],
  rootPath: string,
): string | undefined {
  const find = (nodes: PageRouteDefinition[], parentSegments: string[]): string | undefined => {
    for (const item of nodes) {
      const normalizedPath = item.pageId
        ? pageRouteSegmentFromId(item.pageId)
        : normalizePathSegment(item.path);
      const internalPathSegments = normalizedPath && !item.isUrl
        ? [...parentSegments, normalizedPath]
        : parentSegments;
      if ((item.pageId || item.modulePath) && normalizedPath && !item.isUrl && (!item.resourceKey || hasPermission(item.resourceKey))) {
        return toInternalPath(rootPath, internalPathSegments);
      }
      const childPath = item.children ? find(item.children, internalPathSegments) : undefined;
      if (childPath) return childPath;
    }
    return undefined;
  };

  return find(items, []);
}
