import { useMemo } from 'react';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { usePermission } from '@/hooks/usePermission';
import { createAuthorizedMenus, findFirstAuthorizedMenuPath } from '@/utils/route';

/** 为布局和首页提供当前权限下可见的页面菜单。 */
export function usePageMenus() {
  const { state } = useAuth();
  const { hasPermission } = usePermission();
  const menuRoutes = useMemo(
    () => state === 'ready' ? createAuthorizedMenus(hasPermission, PAGE_ROUTES) : [],
    [hasPermission, state],
  );
  const firstAccessiblePath = useMemo(
    () => state === 'ready' ? findFirstAuthorizedMenuPath(hasPermission, PAGE_ROUTES) : undefined,
    [hasPermission, state],
  );

  return { state, menuRoutes, firstAccessiblePath };
}
