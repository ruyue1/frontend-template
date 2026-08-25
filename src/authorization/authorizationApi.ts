import service from "@/apis/service";
import type {
  AuditList,
  AuthorizationStatus,
  EffectivePermissions,
  Member,
  MemberList,
  MemberRolesRequest,
  PermissionResource,
  ResourceList,
  RevisionRequest,
  RevisionResult,
  Role,
  RoleList,
  RoleResources,
  RoleResourcesRequest,
  RoleStatusRequest,
  RoleUpsertRequest,
  RoleWriteResult,
} from "./types";

export type PageParams = { page?: number; pageSize?: number };
export type RoleListParams = PageParams & { includeDeleted?: boolean };

export const getAuthorizationStatus = () =>
  service.get<AuthorizationStatus>("/api/authorization/status");
export const getMyEffectivePermissions = () =>
  service.get<EffectivePermissions>(
    "/api/authorization/me/effective-permissions",
  );
export const listAuthorizationResources = () =>
  service.get<ResourceList>("/api/authorization/resources");
export const getAuthorizationResource = (resourceKey: string) =>
  service.get<PermissionResource>(
    `/api/authorization/resources/${encodeURIComponent(resourceKey)}`,
  );
export const listAuthorizationRoles = (params: RoleListParams = {}) =>
  service.get<RoleList>("/api/authorization/roles", { params });
export const createAuthorizationRole = (request: RoleUpsertRequest) =>
  service
    .post<RoleWriteResult>("/api/authorization/roles", request)
    .then(({ data }) => data);
export const getAuthorizationRole = (roleId: string) =>
  service.get<Role>(`/api/authorization/roles/${encodeURIComponent(roleId)}`);
export const updateAuthorizationRole = (
  roleId: string,
  request: RoleUpsertRequest,
) =>
  service.put<RoleWriteResult>(
    `/api/authorization/roles/${encodeURIComponent(roleId)}`,
    request,
  );
export const deleteAuthorizationRole = (
  roleId: string,
  request: RevisionRequest,
) =>
  service.delete<RevisionResult>(
    `/api/authorization/roles/${encodeURIComponent(roleId)}`,
    { data: request },
  );
export const setAuthorizationRoleStatus = (
  roleId: string,
  request: RoleStatusRequest,
) =>
  service.put<RoleWriteResult>(
    `/api/authorization/roles/${encodeURIComponent(roleId)}/status`,
    request,
  );
export const getAuthorizationRoleResources = (roleId: string) =>
  service.get<RoleResources>(
    `/api/authorization/roles/${encodeURIComponent(roleId)}/resources`,
  );
export const replaceAuthorizationRoleResources = (
  roleId: string,
  request: RoleResourcesRequest,
) =>
  service.put<RoleResources>(
    `/api/authorization/roles/${encodeURIComponent(roleId)}/resources`,
    request,
  );
export const listAuthorizationMembers = (params: PageParams = {}) =>
  service.get<MemberList>("/api/authorization/members", { params });
export const getAuthorizationMember = (subjectId: string) =>
  service.get<Member>(
    `/api/authorization/members/${encodeURIComponent(subjectId)}`,
  );
export const deleteAuthorizationMember = (
  subjectId: string,
  request: RevisionRequest,
) =>
  service.delete<RevisionResult>(
    `/api/authorization/members/${encodeURIComponent(subjectId)}`,
    { data: request },
  );
export const replaceAuthorizationMemberRoles = (
  subjectId: string,
  request: MemberRolesRequest,
) =>
  service.put<Member>(
    `/api/authorization/members/${encodeURIComponent(subjectId)}/roles`,
    request,
  );
export const getAuthorizationMemberEffectivePermissions = (subjectId: string) =>
  service.get<EffectivePermissions>(
    `/api/authorization/members/${encodeURIComponent(subjectId)}/effective-permissions`,
  );
export const listAuthorizationAudit = (params: PageParams = {}) =>
  service.get<AuditList>("/api/authorization/audit", { params });
