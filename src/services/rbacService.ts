// src/services/rbacService.ts
import { apiFetch } from "./api";

export type RoleDto = { id: string; key: string; name: string };

export type PermissionDto = {
  id: string;
  key: string;
  label: string;
  group?: string | null;
};

export const rbacService = {
  listRoles(): Promise<RoleDto[]> {
    return apiFetch("/api/admin/rbac/roles");
  },

  listPermissions(): Promise<PermissionDto[]> {
    return apiFetch("/api/admin/rbac/permissions");
  },

  async getRolePermissions(roleId: string): Promise<string[]> {
    const data = await apiFetch(`/api/admin/rbac/roles/${roleId}/permissions`);
    return (data?.permissions ?? []).map((p: any) => String(p.key));
  },

  updateRolePermissions(roleId: string, permissionKeys: string[]) {
    return apiFetch(`/api/admin/rbac/roles/${roleId}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionKeys }),
    });
  },

  removeRolePermission(roleId: string, permissionId: string) {
    return apiFetch(`/api/admin/rbac/roles/${roleId}/permissions/${permissionId}`, {
      method: "DELETE",
    });
  },

  async getUserRoles(userId: string): Promise<string[]> {
    const data = await apiFetch(`/api/admin/rbac/users/${userId}/roles`);
    return (data?.roles ?? []).map((r: any) => String(r.key));
  },

  updateUserRoles(userId: string, roleKeys: string[]) {
    return apiFetch(`/api/admin/rbac/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleKeys }),
    });
  },
};
