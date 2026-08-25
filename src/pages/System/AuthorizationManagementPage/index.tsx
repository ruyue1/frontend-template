import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as authorizationApi from '@/authorization/authorizationApi';
import type { Member, PermissionResource, Role } from '@/authorization/types';

type Loadable<T> = { loading: boolean; data: T; error?: unknown };
const errorMessage = (error: any) => error?.response?.data?.message || error?.message || '请求失败，请稍后重试。';
const errorTitle = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return ({ 401: '登录状态已失效', 403: '无权限执行此操作', 409: '授权版本冲突', 503: '权限运行时尚未就绪' } as Record<number, string>)[status || 0] || '请求失败';
};

export default function AuthorizationManagementPage() {
  const [revision, setRevision] = useState(0);
  const [roles, setRoles] = useState<Loadable<Role[]>>({ loading: true, data: [] });
  const [members, setMembers] = useState<Loadable<Member[]>>({ loading: true, data: [] });
  const [resources, setResources] = useState<Loadable<PermissionResource[]>>({ loading: true, data: [] });
  const [roleModal, setRoleModal] = useState<Role | null | undefined>();
  const [resourceRole, setResourceRole] = useState<Role | null>(null);
  const [memberRole, setMemberRole] = useState<Role | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setRoles((state) => ({ ...state, loading: true, error: undefined }));
    setMembers((state) => ({ ...state, loading: true, error: undefined }));
    setResources((state) => ({ ...state, loading: true, error: undefined }));
    const [roleResult, memberResult, resourceResult] = await Promise.allSettled([
      authorizationApi.listAuthorizationRoles({ pageSize: 100, includeDeleted: true }),
      authorizationApi.listAuthorizationMembers({ pageSize: 100 }),
      authorizationApi.listAuthorizationResources(),
    ]);
    if (roleResult.status === 'fulfilled') { setRoles({ loading: false, data: roleResult.value.items }); setRevision(roleResult.value.revision); }
    else setRoles({ loading: false, data: [], error: roleResult.reason });
    if (memberResult.status === 'fulfilled') { setMembers({ loading: false, data: memberResult.value.items }); setRevision(memberResult.value.revision); }
    else setMembers({ loading: false, data: [], error: memberResult.reason });
    if (resourceResult.status === 'fulfilled') { setResources({ loading: false, data: resourceResult.value.items }); setRevision(resourceResult.value.revision); }
    else setResources({ loading: false, data: [], error: resourceResult.reason });
  }, []);
  useEffect(() => { load(); }, [load]);

  const roleMembers = useMemo(() => memberRole ? members.data.filter((member) => member.roleIds.includes(memberRole.roleId)) : [], [memberRole, members.data]);
  const refresh = async () => { await load(); message.success('数据已刷新'); };
  const submitRole = async () => {
    const values = await form.validateFields();
    try {
      if (roleModal) await authorizationApi.updateAuthorizationRole(roleModal.roleId, { ...values, expectedRevision: revision });
      else await authorizationApi.createAuthorizationRole({ ...values, expectedRevision: revision });
      message.success(roleModal ? '角色已更新' : '角色已创建'); setRoleModal(undefined); load();
    } catch (error) { message.error(errorMessage(error)); }
  };
  const setRoleStatus = async (role: Role, active: boolean) => {
    try { await authorizationApi.setAuthorizationRoleStatus(role.roleId, { active, expectedRevision: revision }); message.success('角色状态已更新'); load(); }
    catch (error) { message.error(errorMessage(error)); }
  };
  const addMember = async () => {
    const subjectId = employeeId.trim();
    if (!memberRole || !subjectId) { message.warning('请输入员工 ID'); return; }
    try {
      let member: Member | undefined;
      try { member = await authorizationApi.getAuthorizationMember(subjectId); } catch (error: any) { if (error?.response?.status !== 404) throw error; }
      const roleIds = [...new Set([...(member?.roleIds || []), memberRole.roleId])];
      await authorizationApi.replaceAuthorizationMemberRoles(subjectId, { roleIds, displayName: member?.displayName || subjectId, expectedRevision: revision });
      message.success(`已将 ${subjectId} 添加到 ${memberRole.name}`); setEmployeeId(''); load();
    } catch (error) { message.error(errorMessage(error)); }
  };
  const removeMember = async (member: Member) => {
    if (!memberRole) return;
    try {
      await authorizationApi.replaceAuthorizationMemberRoles(member.subjectId, { roleIds: member.roleIds.filter((roleId) => roleId !== memberRole.roleId), displayName: member.displayName, expectedRevision: revision });
      message.success(`已从 ${memberRole.name} 移除 ${member.subjectId}`); load();
    } catch (error) { message.error(errorMessage(error)); }
  };
  const saveResources = async () => {
    if (!resourceRole) return;
    try {
      await authorizationApi.replaceAuthorizationRoleResources(resourceRole.roleId, { resourceKeys: form.getFieldValue('resourceKeys') || [], expectedRevision: revision });
      message.success('角色资源已更新'); setResourceRole(null); load();
    } catch (error) { message.error(errorMessage(error)); }
  };
  const columns: ColumnsType<Role> = [
    { title: '角色', dataIndex: 'name', render: (name, role) => <Space><Typography.Text strong>{name}</Typography.Text>{role.isSystemRole && <Tag color="blue">系统</Tag>}{role.isInitialAdminRole && <Tag color="gold">初始管理员</Tag>}</Space> },
    { title: '说明', dataIndex: 'description', ellipsis: true }, { title: '资源点', render: (_, role) => role.resourceKeys.length },
    { title: '状态', render: (_, role) => <Switch checked={role.active} disabled={role.deleted || role.isInitialAdminRole} checkedChildren="启用" unCheckedChildren="停用" onChange={(active) => setRoleStatus(role, active)} /> },
    { title: '操作', render: (_, role) => <Space wrap><Button type="link" disabled={role.isSystemRole} onClick={() => { setRoleModal(role); form.setFieldsValue(role); }}>编辑</Button><Button type="link" disabled={role.deleted} onClick={() => { setResourceRole(role); form.setFieldsValue({ resourceKeys: role.resourceKeys }); }}>授权资源</Button><Button type="link" disabled={role.deleted} onClick={() => { setMemberRole(role); setEmployeeId(''); }}>配置成员</Button><Popconfirm title="删除该角色？" description="该操作使用当前授权版本确认。" disabled={role.deleted || role.isSystemRole} onConfirm={async () => { try { await authorizationApi.deleteAuthorizationRole(role.roleId, { expectedRevision: revision }); message.success('角色已删除'); load(); } catch (error) { message.error(errorMessage(error)); } }}><Button type="link" danger disabled={role.deleted || role.isSystemRole}>删除</Button></Popconfirm></Space> },
  ];
  const failure = roles.error || members.error || resources.error;

  return <div className="authorization-page">
    <Card className="authorization-hero" bordered={false}><Space direction="vertical" size={4}><Typography.Title level={2}>角色管理</Typography.Title><Typography.Text type="secondary">管理角色及其成员。当前授权版本：{revision}</Typography.Text></Space><Button onClick={refresh}>刷新</Button></Card>
    {failure ? <Alert className="authorization-alert" type="error" showIcon message={errorTitle(failure)} description={errorMessage(failure)} action={<Button onClick={refresh}>重试</Button>} /> : null}
    <Card extra={<Button type="primary" onClick={() => { setRoleModal(null); form.resetFields(); }}>创建角色</Button>}><Table rowKey="roleId" loading={roles.loading || members.loading || resources.loading} dataSource={roles.data} columns={columns} locale={{ emptyText: <Empty description="暂无角色" /> }} pagination={{ pageSize: 10 }} /></Card>
    <Modal open={roleModal !== undefined} title={roleModal ? '修改角色' : '创建角色'} onCancel={() => setRoleModal(undefined)} onOk={submitRole}><Form form={form} layout="vertical"><Form.Item name="name" label="角色名称" rules={[{ required: true, whitespace: true, max: 100 }]}><Input autoFocus /></Form.Item><Form.Item name="description" label="说明" rules={[{ max: 500 }]}><Input.TextArea rows={4} /></Form.Item></Form></Modal>
    <Modal open={!!resourceRole} title={`授权资源 · ${resourceRole?.name || ''}`} onCancel={() => setResourceRole(null)} onOk={saveResources}><Form form={form} layout="vertical"><Form.Item name="resourceKeys" label="资源点（保存时全量替换）"><Select mode="multiple" optionFilterProp="label" options={resources.data.map((resource) => ({ value: resource.resourceKey, label: `${resource.name}（${resource.resourceKey}）` }))} /></Form.Item></Form></Modal>
    <Modal open={!!memberRole} title={`配置成员 · ${memberRole?.name || ''}`} footer={null} onCancel={() => setMemberRole(null)}><Space.Compact style={{ display: 'flex', marginBottom: 16 }}><Input value={employeeId} placeholder="输入员工 ID" onChange={(event) => setEmployeeId(event.target.value)} onPressEnter={addMember} /><Button type="primary" onClick={addMember}>添加</Button></Space.Compact><Typography.Paragraph type="secondary">输入员工 ID 后添加；已有成员会保留其其他角色。</Typography.Paragraph><Table rowKey="subjectId" size="small" dataSource={roleMembers} pagination={false} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该角色暂未配置成员" /> }} columns={[{ title: '员工 ID', dataIndex: 'subjectId' }, { title: '名称', dataIndex: 'displayName', render: (value, member) => value || member.subjectId }, { title: '操作', render: (_, member) => <Popconfirm title={`从 ${memberRole?.name} 移除该成员？`} onConfirm={() => removeMember(member)}><Button type="link" danger>移除</Button></Popconfirm> }]} /></Modal>
  </div>;
}
