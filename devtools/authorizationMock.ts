import type { Plugin } from 'vite';

type Role = { roleId: string; name: string; description: string | null; active: boolean; deleted: boolean; isSystemRole: boolean; isInitialAdminRole: boolean; resourceKeys: string[] };
type Member = { subjectId: string; displayName: string | null; source: 'seed' | 'preconfigured' | 'jit'; roleIds: string[] };

const resources = [
  { resourceKey: 'system_authorization_management', origin: 'system', type: 'system', name: '系统权限管理', description: '管理授权目录、角色与成员', semanticDefinition: '允许访问权限管理页面及其所有操作。' },
  { resourceKey: 'business_orders_read', origin: 'business', type: 'page', name: '订单查询', description: '查看订单列表与详情', semanticDefinition: '允许读取订单业务数据。' },
  { resourceKey: 'business_orders_export', origin: 'business', type: 'operation', name: '导出订单', description: '导出当前筛选的订单', semanticDefinition: '允许执行订单导出操作。' },
];
let revision = 7;
let roles: Role[] = [
  { roleId: '00000000-0000-4000-8000-000000000001', name: '系统管理员', description: '内置初始管理员角色', active: true, deleted: false, isSystemRole: true, isInitialAdminRole: true, resourceKeys: resources.map((item) => item.resourceKey) },
  { roleId: '00000000-0000-4000-8000-000000000002', name: '运营专员', description: '负责日常订单处理', active: true, deleted: false, isSystemRole: false, isInitialAdminRole: false, resourceKeys: ['business_orders_read'] },
];
let members: Member[] = [
  { subjectId: '10000001', displayName: '演示管理员', source: 'seed', roleIds: [roles[0].roleId] },
  { subjectId: '10000002', displayName: '王小明', source: 'preconfigured', roleIds: [roles[1].roleId] },
];
const audit: any[] = [{ id: '00000000-0000-4000-8000-000000000099', actorSubjectId: '10000001', action: 'role.created', target: '运营专员', revision, occurredAt: new Date().toISOString() }];

const json = (res: any, status: number, body: unknown) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
const readBody = (req: any) => new Promise<any>((resolve) => { let raw = ''; req.on('data', (chunk: Buffer) => { raw += chunk; }); req.on('end', () => resolve(raw ? JSON.parse(raw) : {})); });
const list = <T,>(items: T[]) => ({ items, total: items.length, page: 1, pageSize: 100, revision });
const changed = (action: string, target: string) => { revision += 1; audit.unshift({ id: crypto.randomUUID(), actorSubjectId: '10000001', action, target, revision, occurredAt: new Date().toISOString() }); };

/** Development-only mock server. It is not included in the production Vite build. */
export function authorizationMockPlugin(): Plugin {
  return {
    name: 'authorization-management-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/authorization', async (req: any, res: any, next: () => void) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const path = url.pathname;
        const body = ['POST', 'PUT', 'DELETE'].includes(req.method || '') ? await readBody(req) : {};
        const currentRoles = roles.filter((role) => url.searchParams.get('includeDeleted') === 'true' || !role.deleted);
        if (req.method === 'GET' && path === '/status') return json(res, 200, { ready: true, contractVersion: 'authorization-api.v1', reason: null });
        if (req.method === 'GET' && path === '/me/effective-permissions') return json(res, 200, { subjectId: '10000001', resourceKeys: resources.map((item) => item.resourceKey), revision });
        if (req.method === 'GET' && path === '/resources') return json(res, 200, list(resources));
        if (req.method === 'GET' && path === '/roles') return json(res, 200, list(currentRoles));
        if (req.method === 'POST' && path === '/roles') { const role: Role = { roleId: crypto.randomUUID(), name: body.name, description: body.description || null, active: true, deleted: false, isSystemRole: false, isInitialAdminRole: false, resourceKeys: [] }; roles.push(role); changed('role.created', role.name); return json(res, 201, { role, revision }); }
        if (req.method === 'GET' && path === '/members') return json(res, 200, list(members));
        if (req.method === 'GET' && path === '/audit') return json(res, 200, list(audit));
        const roleMatch = path.match(/^\/roles\/([^/]+)(?:\/(status|resources))?$/);
        if (roleMatch) {
          const role = roles.find((item) => item.roleId === roleMatch[1]); if (!role) return json(res, 404, { code: 'not_found', message: '角色不存在' });
          if (req.method === 'GET' && !roleMatch[2]) return json(res, 200, role);
          if (req.method === 'PUT' && !roleMatch[2]) { role.name = body.name; role.description = body.description || null; changed('role.updated', role.name); return json(res, 200, { role, revision }); }
          if (req.method === 'DELETE') { role.deleted = true; changed('role.deleted', role.name); return json(res, 200, { revision }); }
          if (req.method === 'PUT' && roleMatch[2] === 'status') { role.active = body.active; changed('role.status_changed', role.name); return json(res, 200, { role, revision }); }
          if (req.method === 'GET' && roleMatch[2] === 'resources') return json(res, 200, { roleId: role.roleId, resourceKeys: role.resourceKeys, revision });
          if (req.method === 'PUT' && roleMatch[2] === 'resources') { role.resourceKeys = body.resourceKeys || []; changed('role.resources_replaced', role.name); return json(res, 200, { roleId: role.roleId, resourceKeys: role.resourceKeys, revision }); }
        }
        const memberMatch = path.match(/^\/members\/([^/]+)(?:\/(roles|effective-permissions))?$/);
        if (memberMatch) {
          let member = members.find((item) => item.subjectId === decodeURIComponent(memberMatch[1]));
          if (!member && req.method === 'PUT' && memberMatch[2] === 'roles') {
            member = { subjectId: decodeURIComponent(memberMatch[1]), displayName: body.displayName || null, source: 'preconfigured', roleIds: [] };
            members.push(member);
          }
          if (!member) return json(res, 404, { code: 'not_found', message: '成员不存在' });
          if (req.method === 'GET' && !memberMatch[2]) return json(res, 200, member);
          if (req.method === 'DELETE') { members = members.filter((item) => item !== member); changed('member.deleted', member.subjectId); return json(res, 200, { revision }); }
          if (req.method === 'PUT' && memberMatch[2] === 'roles') { member.roleIds = body.roleIds || []; member.displayName = body.displayName || null; changed('member.roles_replaced', member.subjectId); return json(res, 200, member); }
          if (req.method === 'GET' && memberMatch[2] === 'effective-permissions') { const keys = [...new Set(member.roleIds.flatMap((id) => roles.find((role) => role.roleId === id)?.resourceKeys || []))]; return json(res, 200, { subjectId: member.subjectId, resourceKeys: keys, revision }); }
        }
        return next();
      });
    },
  };
}
