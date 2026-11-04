import { mockAdminMenuService } from "./mockAdminMenuService";
import type { AdminMenuService } from "../types/adminMenu";

// Temporary until the Express API is connected.
const menuService: AdminMenuService = mockAdminMenuService;

export const adminMenuService = {
  getAll: () => menuService.getAll(),

  create: (input: Parameters<AdminMenuService["create"]>[0]) =>
    menuService.create(input),

  update: (
    id: string,
    input: Parameters<AdminMenuService["update"]>[1]
  ) => menuService.update(id, input),

  toggleAvailability: (id: string) =>
    menuService.toggleAvailability(id),

  delete: (id: string) => menuService.delete(id),
};