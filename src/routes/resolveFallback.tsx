
import { canAccess } from "../utils/auth/access"
import { PRIVATE_ROUTE_RULES } from "./appRoutes";


export function resolvePrivateFallback(me: any) {
  for (const r of PRIVATE_ROUTE_RULES) {
    if (canAccess(me, { roles: r.roles, permissions: r.permissions })) return r.path;
  }
  
  return "/espace-membre/profile";
}
