import type { PageRouteDefinition } from '@/typings/routes';
import { createLayoutMenus, findFirstPagePath } from '@/utils/route';

const pages: PageRouteDefinition[] = [
  {
    name: '目录',
    children: [
      { path: 'dashboard', name: '看板', pageKey: 'DefaultPage' },
    ],
  },
  {
    path: 'system',
    name: '系统',
    children: [
      { path: 'roles', name: '角色', pageKey: 'System/Role' },
      { path: 'https://example.com', name: '帮助', isUrl: true, target: '_blank' },
    ],
  },
];

describe('unified page route configuration', () => {
  it('keeps pathless directories out of the URL while preserving child routes', () => {
    expect(createLayoutMenus(pages, 'page')).toEqual([
      {
        name: '目录', key: undefined, path: undefined, children: [
          { path: '/page/dashboard', name: '看板', key: 'DefaultPage', children: undefined },
        ],
      },
      {
        path: '/page/system', name: '系统', key: undefined, children: [
          { path: '/page/system/roles', name: '角色', key: 'System/Role', children: undefined },
          { path: 'https://example.com', name: '帮助', isUrl: true, target: '_blank', key: undefined, children: undefined },
        ],
      },
    ]);
  });

  it('uses the first internal page as the /page entry destination', () => {
    expect(findFirstPagePath(pages, 'page')).toBe('/page/dashboard');
  });
});
