import type { PageRouteDefinition } from '@/typings/routes';
import {
  createAuthorizedMenus,
  findFirstAuthorizedMenuPath,
} from '@/utils/route';

const pages: PageRouteDefinition[] = [
  {
    path: '/page/assets',
    resourceKey: 'page_asset_list',
    menu: { key: 'assets', label: '资产管理' },
    element: <div />,
  },
  {
    path: '/page/assets/:id',
    resourceKey: 'page_asset_detail',
    element: <div />,
  },
];

describe('page route utilities', () => {
  it('only creates menu entries for permitted pages with menu metadata', () => {
    expect(createAuthorizedMenus((key) => key === 'page_asset_list', pages)).toEqual([
      {
        key: 'assets',
        name: '资产管理',
        icon: undefined,
        path: '/page/assets',
      },
    ]);
  });

  it('uses the first permitted menu page as the page entry destination', () => {
    expect(findFirstAuthorizedMenuPath((key) => key === 'page_asset_list', pages)).toBe('/page/assets');
    expect(findFirstAuthorizedMenuPath(() => false, pages)).toBeUndefined();
  });
});
