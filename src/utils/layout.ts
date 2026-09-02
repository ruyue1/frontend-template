import type { Route } from '@typings/workbench';
import { PAGE_ROUTE } from '@/constants/routes';

function normalizePathSegment(path?: string) {
  return path?.replace(/^\/+|\/+$/g, '') ?? '';
}

export function transformBizMenuForProLayout(menus: Route[], rootPath = PAGE_ROUTE): Route[] {
  const normalizedRootPath = normalizePathSegment(rootPath);

  const walk = (items: Route[], parentPathSegments: string[], hasMissingParentPath: boolean): Route[] => {
    return items.map((item) => {
      const normalizedCurrentPath = normalizePathSegment(item.path);
      const currentHasPath = Boolean(normalizedCurrentPath);
      const children = item.children?.length
        ? walk(
            item.children,
            currentHasPath ? [...parentPathSegments, normalizedCurrentPath] : parentPathSegments,
            hasMissingParentPath || !currentHasPath,
          )
        : undefined;
      const nextItem: Route = {
        ...item,
        children,
      };

      const isLeafNode = !children?.length;
      if (isLeafNode && item.key && currentHasPath && hasMissingParentPath) {
        nextItem.path = [normalizedRootPath, ...parentPathSegments, normalizedCurrentPath].join('/');
      }

      return nextItem;
    });
  };

  if (!Array.isArray(menus) || menus.length === 0) return [];

  return walk(menus, [], false);
}