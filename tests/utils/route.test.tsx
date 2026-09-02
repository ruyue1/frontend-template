import type { PageRouteDefinition } from '@/typings/routes';
import {
  createAuthorizedMenus,
  findFirstAuthorizedMenuPath,
} from '@/utils/route';

const pages: PageRouteDefinition[] = [
  {
    menu: { key: 'business', label: '业务管理' },
    children: [
      {
        path: 'assets',
        pageId: 'asset_list',
        resourceKey: 'page_asset_list',
        menu: { key: 'assets', label: '资产管理' },
      },
      {
        path: 'dashboard',
        pageId: 'dashboard',
        menu: { key: 'dashboard', label: '业务看板' },
      },
    ],
  },
  {
    path: 'https://example.com',
    isUrl: true,
    resourceKey: 'external_help',
    menu: { key: 'help', label: '帮助中心' },
  },
];

describe('page route utilities', () => {
  it('keeps directories with permitted descendants and filters protected nodes', () => {
    expect(createAuthorizedMenus((key) => key === 'page_asset_list', pages, 'page')).toEqual([
      {
        key: 'business', name: '业务管理', icon: undefined, path: undefined,
        isUrl: undefined, target: undefined,
        children: [
          {
            key: 'assets', name: '资产管理', icon: undefined, path: '/page/asset-list',
            isUrl: undefined, target: undefined, children: undefined,
          },
          {
            key: 'dashboard', name: '业务看板', icon: undefined, path: '/page/dashboard',
            isUrl: undefined, target: undefined, children: undefined,
          },
        ],
      },
    ]);
    expect(createAuthorizedMenus(() => false, pages, 'page')).toEqual([
      {
        key: 'business', name: '业务管理', icon: undefined, path: undefined,
        isUrl: undefined, target: undefined,
        children: [
          {
            key: 'dashboard', name: '业务看板', icon: undefined, path: '/page/dashboard',
            isUrl: undefined, target: undefined, children: undefined,
          },
        ],
      },
    ]);
  });

  it('uses the first permitted or unbound internal page as the page entry destination', () => {
    expect(findFirstAuthorizedMenuPath((key) => key === 'page_asset_list', pages, 'page')).toBe('/page/asset-list');
    expect(findFirstAuthorizedMenuPath(() => false, pages, 'page')).toBe('/page/dashboard');
  });

});
