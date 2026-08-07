import { describe, expect, it } from "vitest";
import type { User } from "../types/models";
import { canCreateProject, isPrivilegedRole } from "./permissions";

const buildUser = (role: User["role"]): User => ({
  _id: "user-1",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  organizationId: "org-1",
  role,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("permissions", () => {
  it("owner user returns true for isPrivilegedRole and canCreateProject", () => {
    const user = buildUser("owner");

    expect(isPrivilegedRole(user.role)).toBe(true);
    expect(canCreateProject(user)).toBe(true);
  });

  it("admin user returns true for isPrivilegedRole and canCreateProject", () => {
    const user = buildUser("admin");

    expect(isPrivilegedRole(user.role)).toBe(true);
    expect(canCreateProject(user)).toBe(true);
  });

  it("member user returns false for isPrivilegedRole and canCreateProject", () => {
    const user = buildUser("member");

    expect(isPrivilegedRole(user.role)).toBe(false);
    expect(canCreateProject(user)).toBe(false);
  });

  it("null user is handled safely and returns false", () => {
    expect(isPrivilegedRole(null)).toBe(false);
    expect(() => canCreateProject(null)).not.toThrow();
    expect(canCreateProject(null)).toBe(false);
  });

  it("undefined user argument is handled safely and returns false", () => {
    const undefinedUser = undefined as unknown as User | null;

    expect(isPrivilegedRole(undefined)).toBe(false);
    expect(() => canCreateProject(undefinedUser)).not.toThrow();
    expect(canCreateProject(undefinedUser)).toBe(false);
  });
});
