import { pageDirectoryFromId, pageRouteSegmentFromId } from '@/utils/pageIdentity';

describe('XcodeAgent page identity conversion', () => {
  it('converts pageId to deterministic page directories and route segments', () => {
    expect(pageDirectoryFromId('asset_list')).toBe('AssetList');
    expect(pageRouteSegmentFromId('asset_list')).toBe('asset-list');
    expect(pageDirectoryFromId('role_list_v2')).toBe('RoleListV2');
    expect(pageRouteSegmentFromId('role_list_v2')).toBe('role-list-v2');
  });

  it('rejects non-snake-case page identifiers', () => {
    expect(() => pageDirectoryFromId('AssetList')).toThrow('非法 pageId');
    expect(() => pageRouteSegmentFromId('asset-list')).toThrow('非法 pageId');
  });
});
