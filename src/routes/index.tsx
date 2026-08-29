import { Suspense, useMemo } from 'react';
import { RouteObject, useRoutes, Navigate } from 'react-router-dom';
import { BIZ_MENUS } from '@/constants/menus';
import { PAGE_ROUTE } from '@/constants/routes';
import Layout from '@/layout';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import { transformMenuToRoute } from '@/utils/route';
import AuthorizationManagementPage from '@/pages/System/AuthorizationManagementPage';
import { RouteGuard } from '@/authorization/RouteGuard';
import { RESOURCES } from '@/authorization';

// XCODEAGENT_BUSINESS_ROUTE_IMPORTS_START
// XCODEAGENT_BUSINESS_ROUTE_IMPORTS_END

const generateRouter = (routes: RouteObject[]) => {
  return routes.map((item) => {
    if (item.element) {
      item.element = <Suspense>{item.element}</Suspense>;
    }
    if (item.children?.length) {
      item.children = generateRouter(item.children);
    }
    return item;
  });
};

/**
 * 注册页面路由
 */
const routeList: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        path: PAGE_ROUTE,
        element: <Layout />,
        children: [
          // XCODEAGENT_BUSINESS_ROUTES_START
          // XCODEAGENT_BUSINESS_ROUTES_END
        ],
      },
      {
        path: '/roles',
        element: <Layout />,
        children: [
          {
            index: true,
            element: (
              <RouteGuard
                resourceKey={RESOURCES.SYSTEM.AUTHORIZATION_MANAGEMENT}
              >
                <AuthorizationManagementPage />
              </RouteGuard>
            ),
          },
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
  const routes = useMemo(() => generateRouter(routeList), []);
  return useRoutes(routes);
};

export { Routes, routeList };
