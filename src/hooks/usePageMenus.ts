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
    () => createAuthorizedMenus(hasPermission, PAGE_ROUTES),
    [hasPermission],
  );
  const firstAccessiblePath = useMemo(
    () => findFirstAuthorizedMenuPath(hasPermission, PAGE_ROUTES),
    [hasPermission],
  );

  return { state, menuRoutes, firstAccessiblePath };
}
