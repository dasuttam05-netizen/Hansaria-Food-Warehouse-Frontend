import axios from "axios";

export const ROLE_PERMISSION_PRESETS = {
  admin: ["all"],
  manager: [
    "dashboard.view",
    "employees.view",
    "employees.create",
    "employees.edit",
    "employees.delete",
    "companies.manage",
    "companyAccounts.manage",
    "locations.manage",
    "warehouses.manage",
    "products.manage",
    "inward.view",
    "inward.create",
    "inward.edit",
    "inward.delete",
    "outward.view",
    "outward.create",
    "outward.edit",
    "outward.delete",
    "adjustment.manage",
    "settlement.view",
    "expense.view",
    "expense.create",
    "expense.edit",
    "expense.delete",
    "cash.view",
    "cash.create",
    "cash.edit",
    "cash.delete",
    "report.inward",
    "report.erp",
    "report.partyLedger",
    "report.partyStock",
    "report.warehouseRentLedger",
    "report.warehouseRentMonthEnd",
    "report.outwardSettlement",
    "report.expense",
    "report.cash",
    "transport.manage",
  ],
  staff: [
    "dashboard.view",
    "inward.view",
    "inward.create",
    "outward.view",
    "outward.create",
    "adjustment.manage",
    "settlement.view",
    "report.inward",
    "report.outwardSettlement",
  ],
  viewer: ["dashboard.view", "report.inward"],
};

const PERMISSION_DEPENDENCIES = {};

const LEGACY_PERMISSION_MAP = {
  "cash.view": ["expense.manage", "expense.view"],
  "cash.create": ["expense.manage", "expense.create"],
  "cash.edit": ["expense.manage", "expense.edit"],
  "cash.delete": ["expense.manage", "expense.delete"],
  "employees.create": ["employees.manage"],
  "employees.edit": ["employees.manage"],
  "employees.delete": ["employees.manage"],
  "inward.view": ["inward.manage"],
  "inward.create": ["inward.manage"],
  "inward.edit": ["inward.manage"],
  "inward.delete": ["inward.manage"],
  "outward.view": ["outward.manage"],
  "outward.create": ["outward.manage"],
  "outward.edit": ["outward.manage"],
  "outward.delete": ["outward.manage"],
  "expense.view": ["expense.manage", "cash.view"],
  "expense.create": ["expense.manage", "cash.create"],
  "expense.edit": ["expense.manage", "cash.edit"],
  "expense.delete": ["expense.manage", "cash.delete"],
  "settlement.view": ["reports.view"],
  "report.inward": ["reports.view"],
  "report.erp": ["reports.view"],
  "report.partyLedger": ["reports.view"],
  "report.partyStock": ["reports.view"],
  "report.warehouseRentLedger": ["reports.view"],
  "report.warehouseRentMonthEnd": ["reports.view"],
  "report.outwardSettlement": ["reports.view"],
  "report.expense": ["reports.view"],
  "report.cash": ["reports.view"],
  "warehouses.view": ["warehouses.manage"],
};

function expandPermissions(permissions = []) {
  const expanded = new Set(permissions || []);

  const addDependencies = (permission) => {
    const deps = PERMISSION_DEPENDENCIES[permission] || [];
    deps.forEach((dep) => {
      if (!expanded.has(dep)) {
        expanded.add(dep);
        addDependencies(dep);
      }
    });
  };

  [...expanded].forEach(addDependencies);
  return [...expanded];
}

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

export function normalizePermissions(role = "staff", permissions = []) {
  if (role === "admin") {
    return ["all"];
  }

  if (Array.isArray(permissions) && permissions.length > 0) {
    return expandPermissions(permissions);
  }

  return expandPermissions(ROLE_PERMISSION_PRESETS[role] || []);
}

export function applyAuthToken(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function saveSession(token, user) {
  const normalizedUser = {
    ...user,
    role: user?.role || "staff",
    permissions: normalizePermissions(user?.role, user?.permissions),
  };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  applyAuthToken(token);

  return normalizedUser;
}

export function loadSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    applyAuthToken(null);
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    const user = {
      ...parsedUser,
      role: parsedUser?.role || "staff",
      permissions: normalizePermissions(parsedUser?.role, parsedUser?.permissions),
    };

    applyAuthToken(token);
    return { token, user };
  } catch (error) {
    clearSession();
    return { token: null, user: null };
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  applyAuthToken(null);
}

export function hasPermission(user, permission) {
  if (!user || !permission) {
    return false;
  }

  const permissions = normalizePermissions(user.role, user.permissions);
  return (
    user.role === "admin" ||
    permissions.includes("all") ||
    permissions.includes(permission) ||
    (LEGACY_PERMISSION_MAP[permission] || []).some((item) => permissions.includes(item))
  );
}

export function hasAnyPermission(user, permissions = []) {
  return (permissions || []).some((permission) => hasPermission(user, permission));
}
