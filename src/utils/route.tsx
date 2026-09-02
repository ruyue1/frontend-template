import type { Route } from '@typings/workbench';
import type { PageRouteDefinition } from '@/typings/routes';

function normalizePathSegment(path?: string) {
  return path?.replace(/^\/+|\/+$/g, '') ?? '';
}

/** 从统一业务配置生成 ProLayout 菜单，并将内部链接解析为 /page/... 绝对路径。 */
export function createLayoutMenus(items: PageRouteDefinition[], rootPath: string): Route[] {
  const normalizedRootPath = normalizePathSegment(rootPath);

  const walk = (nodes: PageRouteDefinition[], parentPathSegments: string[]): Route[] => nodes.map((item) => {
    const normalizedPath = normalizePathSegment(item.path);
    const nextParentPathSegments = normalizedPath && !item.isUrl
      ? [...parentPathSegments, normalizedPath]
      : parentPathSegments;
    const children = item.children?.length ? walk(item.children, nextParentPathSegments) : undefined;
    const nextItem: Route = {
      ...item,
      key: item.pageKey ?? item.key,
      path: item.isUrl || !normalizedPath
        ? item.path
        : `/${[normalizedRootPath, ...nextParentPathSegments].join('/')}`,
      children,
    };
    delete (nextItem as PageRouteDefinition).pageKey;
    delete (nextItem as PageRouteDefinition).resourceKey;
    return nextItem;
  });

  return Array.isArray(items) ? walk(items, []) : [];
}

/** 返回第一个可导航的业务页面，用于 /page 入口重定向。 */
export function findFirstPagePath(items: PageRouteDefinition[], rootPath: string): string | undefined {
  const normalizedRootPath = normalizePathSegment(rootPath);
  const find = (nodes: PageRouteDefinition[], parentPathSegments: string[]): string | undefined => {
    for (const node of nodes) {
      const normalizedPath = normalizePathSegment(node.path);
      const nextParentPathSegments = normalizedPath && !node.isUrl
        ? [...parentPathSegments, normalizedPath]
        : parentPathSegments;
      if (node.pageKey && normalizedPath && !node.isUrl) {
        return `/${[normalizedRootPath, ...nextParentPathSegments].join('/')}`;
      }
      const childPath = node.children ? find(node.children, nextParentPathSegments) : undefined;
      if (childPath) return childPath;
    }
    return undefined;
  };
  return find(items, []);
}
