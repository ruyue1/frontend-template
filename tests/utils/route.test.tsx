import type { PageRouteDefinition } from '@/typings/routes';
import {
  createAuthorizedMenus,
  createProtectedRoutes,
  findFirstAuthorizedMenuPath,
} from '@/utils/route';
import { RouteGuard } from '@/components/authorization/RouteGuard';

const pages: PageRouteDefinition[] = [
  {
    path: '/page/assets',
    resourceKey: 'page_asset_list',
    menu: { key: 'assets', label: '资产管理' },
    element: <div />,
  },
  {
    path: '/page/dashboard',
    menu: { key: 'dashboard', label: '业务看板' },
    element: <div />,
  },
  {
    path: '/page/assets/:id',
    resourceKey: 'page_asset_detail',
    element: <div />,
  },
];

describe('page route utilities', () => {
  it('keeps menus without permission bindings and filters only bound menus', () => {
    expect(createAuthorizedMenus((key) => key === 'page_asset_list', pages)).toEqual([
      {
        key: 'assets',
        name: '资产管理',
        icon: undefined,
        path: '/page/assets',
      },
      {
        key: 'dashboard',
        name: '业务看板',
        icon: undefined,
        path: '/page/dashboard',
      },
    ]);
    expect(createAuthorizedMenus(() => false, pages)).toEqual([
      {
        key: 'dashboard',
        name: '业务看板',
        icon: undefined,
        path: '/page/dashboard',
      },
    ]);
  });

  it('uses the first permitted or unbound menu page as the page entry destination', () => {
    expect(findFirstAuthorizedMenuPath((key) => key === 'page_asset_list', pages)).toBe('/page/assets');
    expect(findFirstAuthorizedMenuPath(() => false, pages)).toBe('/page/dashboard');
  });

  it('only wraps pages with explicit resource bindings in RouteGuard', () => {
    const routes = createProtectedRoutes(pages);
    expect((routes[0].element as React.ReactElement).type).toBe(RouteGuard);
    expect(routes[1].element).toBe(pages[1].element);
  });
});
