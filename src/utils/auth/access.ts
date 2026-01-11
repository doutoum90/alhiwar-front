
import { PROTECTED_MENU } from "../../constantes";
import type { AccessRule, AuthUser } from "../../types";


export function can(me: AuthUser | null | undefined, perm: string) {
  return Array.isArray(me?.permissions) && me!.permissions!.includes(perm);
}

export function canAccess(
  me: AuthUser | null | undefined,
  rule?: { roles?: string[]; permissions?: string[]; permissionsMode?: "all" | "any" }
) {
  if (!me) return false;
  if (!rule || (!rule.roles?.length && !rule.permissions?.length)) return true;

  const userRoles = new Set(
    [
      String(me.role ?? "").toLowerCase(),
      ...(me.roles ?? []).map((r) => String(r).toLowerCase()),
    ].filter(Boolean)
  );

  const userPerms = new Set((me.permissions ?? []).map((p) => String(p)));

  
  if (rule.roles?.length) {
    const okRole = rule.roles.some((r) => userRoles.has(String(r).toLowerCase()));
    if (!okRole) return false;
  }

  
  if (rule.permissions?.length) {
    const mode = rule.permissionsMode ?? "all";

    const okPerm =
      mode === "any"
        ? rule.permissions.some((p) => userPerms.has(String(p)))
        : rule.permissions.every((p) => userPerms.has(String(p)));

    if (!okPerm) return false;
  }

  return true;
}


export function resolvePrivateFallback(me: AuthUser) {
  const safeItems = PROTECTED_MENU.filter((x: any) => x.path !== "/auth/login");

  const firstAllowed = safeItems.find((item: any) =>
    canAccess(me, { roles: item.roles, permissions: item.permissions })
  );

  return firstAllowed?.path ?? "/espace-membre/profile";
}
