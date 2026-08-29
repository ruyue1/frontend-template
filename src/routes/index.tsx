import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import Layout from '@/layout';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import { AuthStateView } from '@/components/authorization/RouteGuard';
import { PAGE_ROUTES } from '@/constants/routes';
import { usePageMenus } from '@/hooks/usePageMenus';
import { createProtectedRoutes } from '@/utils/route';

function PageEntryRedirect() {
  const { state, firstAccessiblePath } = usePageMenus();

  if (state !== 'ready') return <AuthStateView state={state} />;
  if (!firstAccessiblePath) return <div className="authorization-state">暂无可访问页面</div>;

  return <Navigate to={firstAccessiblePath} replace />;
}

/**
 * 注册页面路由
 */
const routeList: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/page', element: <PageEntryRedirect /> },
          ...createProtectedRoutes(PAGE_ROUTES),
        ],
      },
      { path: '/login', element: <Login /> },
      { path: '/logout', element: <Logout /> },
      { index: true, element: <Navigate to='/login' replace /> },
      { path: '*', element: <div>未找到页面</div> },
    ],
  },
];

const Routes = () => {
  return useRoutes(routeList);
};

export { Routes, routeList };
