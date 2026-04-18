import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { hasPermission, loadSession } from "../utils/auth";

const PERMISSION_GROUPS = [
  {
    key: "operations",
    title: "Operations",
    items: [
      { key: "inward_access", label: "Inward", permissions: ["inward.view", "inward.create", "inward.edit", "inward.delete"] },
      { key: "outward_access", label: "Outward", permissions: ["outward.view", "outward.create", "outward.edit", "outward.delete"] },
      { key: "adjustment_access", label: "Outward Adjustment", permissions: ["adjustment.manage"] },
      { key: "settlement_access", label: "Settlement", permissions: ["settlement.view"] },
      { key: "expense_access", label: "Expense", permissions: ["expense.view", "expense.create", "expense.edit", "expense.delete"] },
      { key: "cash_access", label: "Cash Book", permissions: ["cash.view", "cash.create", "cash.edit", "cash.delete"] },
      { key: "transport_access", label: "Transport", permissions: ["transport.manage"] },
    ],
  },
  {
    key: "reports",
    title: "Reports",
    items: [
      { key: "report_inward", label: "Inward Report", permissions: ["report.inward"] },
      { key: "report_erp", label: "ERP Report", permissions: ["report.erp"] },
      { key: "report_party_ledger", label: "Party Ledger", permissions: ["report.partyLedger"] },
      { key: "report_party_stock", label: "Party Stock", permissions: ["report.partyStock"] },
      { key: "report_rent_ledger", label: "Warehouse Rent Ledger", permissions: ["report.warehouseRentLedger"] },
      { key: "report_rent_month_end", label: "Month End Rent", permissions: ["report.warehouseRentMonthEnd"] },
      { key: "report_settlement", label: "Settlement Report", permissions: ["report.outwardSettlement"] },
      { key: "report_expense", label: "Expense Report", permissions: ["report.expense"] },
      { key: "report_cash", label: "Cash Report", permissions: ["report.cash"] },
    ],
  },
  {
    key: "masters",
    title: "Masters and Admin",
    items: [
      { key: "employees_manage", label: "Employees", permissions: ["employees.view", "employees.create", "employees.edit", "employees.delete"] },
      { key: "locations_manage", label: "Location", permissions: ["locations.manage"] },
      { key: "warehouses_manage", label: "Warehouse", permissions: ["warehouses.manage"] },
      { key: "companies_manage", label: "Companies", permissions: ["companies.manage"] },
      { key: "accounts_manage", label: "Company Accounts", permissions: ["companyAccounts.manage"] },
      { key: "products_manage", label: "Products", permissions: ["products.manage"] },
      { key: "dashboard_view", label: "Dashboard", permissions: ["dashboard.view"] },
    ],
  },
];

const ALL_PERMISSION_ITEMS = PERMISSION_GROUPS.flatMap((group) => group.items);

const flattenPermissionsFromToggles = (toggles) =>
  Array.from(
    new Set(
      ALL_PERMISSION_ITEMS.flatMap((item) => (toggles[item.key] ? item.permissions : []))
    )
  );

const togglesFromPermissions = (permissions = []) => {
  const permissionSet = new Set(permissions || []);
  return ALL_PERMISSION_ITEMS.reduce((acc, item) => {
    acc[item.key] = item.permissions.every((permission) => permissionSet.has(permission));
    return acc;
  }, {});
};

const createDefaultFormData = () => ({
  name: "",
  address: "",
  username: "",
  password: "",
  location_id: "",
  role: "",
  permissions: ["dashboard.view"],
  opening_balance: "0",
  opening_balance_type: "dr",
  assigned_warehouse_ids: [],
});

const createRoleForm = () => ({
  name: "",
  toggles: togglesFromPermissions(["dashboard.view"]),
  is_admin: false,
});

export default function EmployeeManagementPage() {
  const { user: currentUser } = loadSession();
  const canCreateEmployee = hasPermission(currentUser, "employees.create");
  const canEditEmployee = hasPermission(currentUser, "employees.edit");
  const canDeleteEmployee = hasPermission(currentUser, "employees.delete");

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [formData, setFormData] = useState(createDefaultFormData());
  const [employeeToggles, setEmployeeToggles] = useState(togglesFromPermissions(["dashboard.view"]));
  const [roleForm, setRoleForm] = useState(createRoleForm());
  const [editId, setEditId] = useState(null);
  const [editRoleId, setEditRoleId] = useState(null);

  const fetchEmployees = async () => {
    const res = await axios.get("/api/employees");
    setEmployees(res.data || []);
  };

  const fetchRoles = async () => {
    const res = await axios.get("/api/roles");
    setRoles(res.data || []);
  };

  const fetchMeta = async () => {
    const [locationRes, warehouseRes] = await Promise.all([axios.get("/api/locations"), axios.get("/api/warehouses")]);
    setLocations(locationRes.data || []);
    setWarehouses(warehouseRes.data || []);
  };

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchRoles(), fetchMeta()]).catch((err) => {
      console.error(err);
      alert("Failed to load users and security data");
    });
  }, []);

  const warehouseOptions = useMemo(
    () => warehouses.map((item) => ({ value: String(item.id), label: item.location_name ? `${item.name} (${item.location_name})` : item.name })),
    [warehouses]
  );

  const roleOptions = useMemo(() => roles.map((role) => ({ value: String(role.id), label: role.name })), [roles]);

  const permissionSummary = useMemo(() => {
    const selected = ALL_PERMISSION_ITEMS.filter((item) => employeeToggles[item.key]).map((item) => item.label);
    return selected.length ? selected.join(", ") : "No access selected";
  }, [employeeToggles]);

  const resetEmployeeForm = () => {
    setFormData(createDefaultFormData());
    setEmployeeToggles(togglesFromPermissions(["dashboard.view"]));
    setEditId(null);
    setShowEmployeeForm(false);
  };

  const resetRoleForm = () => {
    setRoleForm(createRoleForm());
    setEditRoleId(null);
    setShowRoleEditor(false);
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      const selectedRole = roles.find((item) => String(item.id) === String(value));
      if (selectedRole) {
        const selectedPermissions = selectedRole.is_admin ? ["all"] : selectedRole.permissions || [];
        setFormData((prev) => ({ ...prev, role: selectedRole.name }));
        setEmployeeToggles(togglesFromPermissions(selectedPermissions.includes("all") ? ALL_PERMISSION_ITEMS.flatMap((item) => item.permissions) : selectedPermissions));
      } else {
        setFormData((prev) => ({ ...prev, role: "" }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeToggle = (key) => {
    setEmployeeToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRoleToggle = (key) => {
    setRoleForm((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: !prev.toggles[key] } }));
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    const permissions = flattenPermissionsFromToggles(employeeToggles);
    const payload = {
      ...formData,
      role: formData.role || "Custom Role",
      permissions,
      assigned_warehouse_ids: (formData.assigned_warehouse_ids || []).map(Number),
    };

    if (!payload.name || !payload.username || (!editId && !payload.password)) {
      alert("Name, username and password are required");
      return;
    }

    try {
      if (editId) {
        await axios.put(`/api/employees/${editId}`, payload);
      } else {
        await axios.post("/api/employees", payload);
      }
      await Promise.all([fetchEmployees(), fetchMeta()]);
      resetEmployeeForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save employee");
    }
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    const permissions = roleForm.is_admin ? ["all"] : flattenPermissionsFromToggles(roleForm.toggles);
    const payload = { name: roleForm.name, permissions, is_admin: roleForm.is_admin };

    if (!payload.name) {
      alert("Role name is required");
      return;
    }

    try {
      if (editRoleId) {
        await axios.put(`/api/roles/${editRoleId}`, payload);
      } else {
        await axios.post("/api/roles", payload);
      }
      await fetchRoles();
      resetRoleForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save role");
    }
  };

  const handleEditEmployee = (employee) => {
    const assignedWarehouseIds = warehouses.filter((item) => Number(item.employee_id) === Number(employee.id)).map((item) => String(item.id));
    setFormData({
      name: employee.name || "",
      address: employee.address || "",
      username: employee.username || "",
      password: "",
      location_id: employee.location_id || "",
      role: employee.role || "",
      permissions: employee.permissions || [],
      opening_balance: String(employee.opening_balance || 0),
      opening_balance_type: employee.opening_balance_type || "dr",
      assigned_warehouse_ids: assignedWarehouseIds,
    });
    setEmployeeToggles(togglesFromPermissions(employee.permissions || []));
    setEditId(employee.id);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await axios.delete(`/api/employees/${id}`);
    await fetchEmployees();
  };

  const handleEditRole = (role) => {
    setRoleForm({
      name: role.name || "",
      is_admin: !!role.is_admin,
      toggles: togglesFromPermissions(role.permissions || []),
    });
    setEditRoleId(role.id);
    setShowRoleEditor(true);
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    await axios.delete(`/api/roles/${id}`);
    await fetchRoles();
  };

  return (
    <div style={pageStyle}>
      <div style={heroCard}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Users and Security</h2>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Create/edit employee users, define roles, and control access with checkboxes. Users will only have access to the items you tick.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {canCreateEmployee ? <button type="button" onClick={() => setShowEmployeeForm(true)} style={primaryButton}>New User</button> : null}
          <button type="button" onClick={() => setShowRoleManager(true)} style={secondaryButton}>Roles</button>
        </div>
      </div>

      <div style={tableCardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#fff" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Warehouse</th>
              <th style={thStyle}>Access</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => {
              const assignedNames = warehouses.filter((item) => Number(item.employee_id) === Number(employee.id)).map((item) => item.name).join(", ");
              return (
                <tr key={employee.id} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={tdStyle}>{employee.id}</td>
                  <td style={tdStyle}>{employee.name}</td>
                  <td style={tdStyle}>{employee.username}</td>
                  <td style={tdStyle}>{employee.role || "-"}</td>
                  <td style={tdStyle}>{locations.find((item) => Number(item.id) === Number(employee.location_id))?.name || "-"}</td>
                  <td style={tdStyle}>{assignedNames || "-"}</td>
                  <td style={tdStyle}>{Array.isArray(employee.permissions) ? employee.permissions.join(", ") : "-"}</td>
                  <td style={tdStyle}>
                    {canEditEmployee ? <button type="button" onClick={() => handleEditEmployee(employee)} style={miniBlue}>Edit</button> : null}
                    {canDeleteEmployee ? <button type="button" onClick={() => handleDeleteEmployee(employee.id)} style={miniRed}>Delete</button> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showEmployeeForm ? (
        <Modal onClose={resetEmployeeForm} title={editId ? "Edit User" : "Create User"}>
          <form onSubmit={handleSubmitEmployee}>
            <div style={formGrid}>
              <Field label="Name"><input name="name" value={formData.name} onChange={handleEmployeeChange} style={inputStyle} /></Field>
              <Field label="Username"><input name="username" value={formData.username} onChange={handleEmployeeChange} style={inputStyle} /></Field>
              <Field label="Password"><input type="password" name="password" value={formData.password} onChange={handleEmployeeChange} style={inputStyle} /></Field>
              <Field label="Role">
                <select name="role" value={roleOptions.find((item) => item.label === formData.role)?.value || ""} onChange={handleEmployeeChange} style={inputStyle}>
                  <option value="">Custom</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <select name="location_id" value={formData.location_id} onChange={handleEmployeeChange} style={inputStyle}>
                  <option value="">Select Location</option>
                  {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </Field>
              <Field label="Opening Balance">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
                  <input name="opening_balance" value={formData.opening_balance} onChange={handleEmployeeChange} style={inputStyle} />
                  <select name="opening_balance_type" value={formData.opening_balance_type} onChange={handleEmployeeChange} style={inputStyle}>
                    <option value="dr">Dr</option>
                    <option value="cr">Cr</option>
                  </select>
                </div>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Address"><textarea name="address" value={formData.address} onChange={handleEmployeeChange} rows={2} style={{ ...inputStyle, minHeight: 80 }} /></Field>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <MultiSelectDropdown
                  label="Assigned Warehouses"
                  options={warehouseOptions}
                  value={formData.assigned_warehouse_ids}
                  onChange={(next) => setFormData((prev) => ({ ...prev, assigned_warehouse_ids: next }))}
                  placeholder="Select Warehouses"
                />
              </div>
            </div>

            <div style={securityCard}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Access Control List</div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{permissionSummary}</div>
              <div style={groupGrid}>
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.key} style={groupCard}>
                    <div style={groupTitle}>{group.title}</div>
                    {group.items.map((item) => (
                      <label key={item.key} style={checkRow}>
                        <input type="checkbox" checked={!!employeeToggles[item.key]} onChange={() => handleEmployeeToggle(item.key)} />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={actionRow}>
              <button type="submit" style={primaryButton}>Save User</button>
              <button type="button" onClick={resetEmployeeForm} style={dangerButton}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {showRoleManager ? (
        <Modal onClose={() => { setShowRoleManager(false); resetRoleForm(); }} title="Roles">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#64748b" }}>Create or edit roles. Employee create er time শুধু role select করলেই access fill হয়ে যাবে.</div>
            <button type="button" onClick={() => setShowRoleEditor(true)} style={primaryButton}>New Role</button>
          </div>
          <div style={tableCardStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Permissions</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td style={tdStyle}>{role.name}</td>
                    <td style={tdStyle}>{(role.permissions || []).join(", ") || "-"}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => handleEditRole(role)} style={miniBlue}>Edit</button>
                      <button type="button" onClick={() => handleDeleteRole(role.id)} style={miniRed}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showRoleEditor ? (
            <div style={{ ...securityCard, marginTop: 16 }}>
              <form onSubmit={handleSubmitRole}>
                <div style={formGrid}>
                  <Field label="Role Name"><input value={roleForm.name} onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))} style={inputStyle} /></Field>
                  <label style={{ ...checkRow, alignSelf: "end", paddingBottom: 10 }}>
                    <input type="checkbox" checked={roleForm.is_admin} onChange={(e) => setRoleForm((prev) => ({ ...prev, is_admin: e.target.checked }))} />
                    <span>Administrator Role</span>
                  </label>
                </div>
                {!roleForm.is_admin ? (
                  <div style={groupGrid}>
                    {PERMISSION_GROUPS.map((group) => (
                      <div key={group.key} style={groupCard}>
                        <div style={groupTitle}>{group.title}</div>
                        {group.items.map((item) => (
                          <label key={item.key} style={checkRow}>
                            <input type="checkbox" checked={!!roleForm.toggles[item.key]} onChange={() => handleRoleToggle(item.key)} />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div style={actionRow}>
                  <button type="submit" style={primaryButton}>Save Role</button>
                  <button type="button" onClick={resetRoleForm} style={dangerButton}>Cancel</button>
                </div>
              </form>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalWrap}>
        <div style={modalCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>{title}</h3>
            <button type="button" onClick={onClose} style={secondaryButton}>Close</button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const pageStyle = { padding: 14, fontFamily: "Segoe UI, Arial, sans-serif" };
const heroCard = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: "0 10px 24px rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" };
const tableCardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflowX: "auto", boxShadow: "0 10px 24px rgba(15,23,42,0.08)" };
const thStyle = { padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap" };
const tdStyle = { padding: "10px 12px", borderTop: "1px solid #e2e8f0", verticalAlign: "top" };
const primaryButton = { border: "none", background: "#0f766e", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { border: "none", background: "#1e293b", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const dangerButton = { border: "none", background: "#dc2626", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const miniBlue = { border: "none", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "6px 10px", marginRight: 8, cursor: "pointer" };
const miniRed = { border: "none", background: "#dc2626", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.36)", backdropFilter: "blur(4px)", zIndex: 999 };
const modalWrap = { position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", padding: 18, zIndex: 1000 };
const modalCard = { width: "100%", maxWidth: 1180, maxHeight: "92vh", overflowY: "auto", background: "#f8fafc", borderRadius: 18, padding: 20, boxShadow: "0 25px 60px rgba(15,23,42,0.24)" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" };
const securityCard = { marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const groupGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const groupCard = { border: "1px solid #dbe4ea", borderRadius: 14, padding: 14, background: "#fff" };
const groupTitle = { fontWeight: 800, color: "#0f172a", marginBottom: 8, fontSize: 14 };
const checkRow = { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13, color: "#334155" };
const actionRow = { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16, flexWrap: "wrap" };
