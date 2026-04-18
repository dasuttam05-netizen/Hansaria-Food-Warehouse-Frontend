import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDisplayDate } from "../utils/date";
import CashEntryForm from "../components/CashEntryForm";

const emptyForm = () => ({
  voucher_no: "",
  entry_date: new Date().toISOString().split("T")[0],
  transaction_mode: "receipt",
  entry_type: "expense",
  warehouse_id: "",
  company_id: "",
  company_account_id: "",
  description: "",
  amount: "",
  payment_method: "Cash",
  reference_no: "",
  narration: "",
  employee_id: "",
  journal_debit_employee_id: "",
  journal_credit_employee_id: "",
  status: "posted",
});

export default function CashBookPage() {
  const API_BASE = "/api";
  const [loading, setLoading] = useState(false);
  const [postedEntries, setPostedEntries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [agingRows, setAgingRows] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [reportView, setReportView] = useState("active");
  const [filters, setFilters] = useState({
    warehouse_id: "",
    company_id: "",
    employee_id: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, warehousesRes, companiesRes, employeesRes] = await Promise.all([
        axios.get(`${API_BASE}/cash-entries?include_cancelled=1`),
        axios.get(`${API_BASE}/warehouses`),
        axios.get(`${API_BASE}/companies`),
        axios.get(`${API_BASE}/employees`),
      ]);
      const response = entriesRes;
      setPostedEntries(Array.isArray(response.data) ? response.data : []);
      setWarehouses(warehousesRes.data || []);
      setCompanies(companiesRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (err) {
      console.error("Error fetching posted cash entries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadAging = async () => {
      if (!showForm || !editingId || !formData.company_id || !formData.entry_type) {
        setAgingRows([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE}/cash-entries/aging/company/${formData.company_id}`,
          { params: { entry_type: formData.entry_type, source_entry_id: editingId } }
        );
        setAgingRows(res.data || []);
      } catch (err) {
        console.error("Error loading aging:", err);
        setAgingRows([]);
      }
    };
    loadAging();
  }, [API_BASE, showForm, editingId, formData.company_id, formData.entry_type]);

  const ledgerRows = useMemo(() => {
    let runningBalance = 0;

    return postedEntries.map((entry) => {
      // Cash book should follow the actual voucher amount, not pending/adjusted amount.
      const amount = Number(entry.amount ?? 0);
      const isReceipt = String(entry.entry_type || "").toLowerCase() === "income";
      const drAmount = isReceipt ? amount : 0;
      const crAmount = isReceipt ? 0 : amount;

      runningBalance += drAmount - crAmount;

      return {
        ...entry,
        drAmount,
        crAmount,
        balance: runningBalance,
      };
    });
  }, [postedEntries]);

  const filteredRows = useMemo(() => {
    const rows = ledgerRows.filter((row) => {
      const status = String(row.status || "").toLowerCase();
      if (reportView === "active" && status === "cancelled") return false;
      if (reportView === "cancelled" && status !== "cancelled") return false;
      if (filters.warehouse_id && String(row.warehouse_id || "") !== String(filters.warehouse_id))
        return false;
      if (filters.company_id && String(row.company_id || "") !== String(filters.company_id)) return false;
      if (filters.employee_id && String(row.employee_id || "") !== String(filters.employee_id)) return false;
      return true;
    });
    let running = 0;
    return rows.map((row) => {
      running += Number(row.drAmount || 0) - Number(row.crAmount || 0);
      return { ...row, balance: running };
    });
  }, [ledgerRows, filters, reportView]);

  const summary = useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => {
          acc.totalDr += row.drAmount;
          acc.totalCr += row.crAmount;
          acc.balance = row.balance;
          return acc;
        },
        { totalDr: 0, totalCr: 0, balance: 0 }
      ),
    [filteredRows]
  );

  const card = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  };

  const th = {
    background: "#0f766e",
    color: "#fff",
    padding: "10px 12px",
    border: "1px solid #dbe4ea",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const td = {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    whiteSpace: "nowrap",
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      voucher_no: entry.voucher_no || "",
      entry_date: entry.entry_date || new Date().toISOString().split("T")[0],
      transaction_mode: entry.transaction_mode || "receipt",
      entry_type: entry.entry_type || "expense",
      warehouse_id: entry.warehouse_id ? String(entry.warehouse_id) : "",
      company_id: entry.company_id ? String(entry.company_id) : "",
      company_account_id: entry.company_account_id ? String(entry.company_account_id) : "",
      description: entry.description || "",
      amount: entry.amount || "",
      payment_method: entry.payment_method || "Cash",
      reference_no: entry.reference_no || "",
      narration: entry.narration || "",
      employee_id: entry.employee_id ? String(entry.employee_id) : "",
      journal_debit_employee_id: entry.journal_debit_employee_id
        ? String(entry.journal_debit_employee_id)
        : "",
      journal_credit_employee_id: entry.journal_credit_employee_id
        ? String(entry.journal_credit_employee_id)
        : "",
      status: entry.status || "posted",
    });
    setShowForm(true);
    const existingAdjustments = Array.isArray(entry.adjustments)
      ? entry.adjustments.reduce((acc, item) => {
          const targetId = Number(item?.target_entry_id);
          const amount = Number(item?.adjusted_amount || 0);
          if (targetId > 0 && amount > 0) acc[targetId] = amount;
          return acc;
        }, {})
      : {};
    setAdjustments(existingAdjustments);
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm());
    setAgingRows([]);
    setAdjustments({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const adjustmentRows = Object.entries(adjustments)
        .map(([target_entry_id, value]) => ({
          target_entry_id: Number(target_entry_id),
          adjusted_amount: Number(value || 0),
        }))
        .filter((item) => item.adjusted_amount > 0);

      await axios.put(`${API_BASE}/cash-entries/${editingId}`, {
        ...formData,
        adjustments: adjustmentRows,
      });
      closeForm();
      fetchData();
    } catch (err) {
      alert("Error updating entry: " + (err.response?.data?.error || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this cash book entry?")) return;
    try {
      await axios.delete(`${API_BASE}/cash-entries/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting entry: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelAllVisible = async () => {
    if (reportView === "cancelled") return;
    const ids = filteredRows.map((r) => r.id).filter(Boolean);
    if (!ids.length) {
      alert("No active entries to cancel.");
      return;
    }
    if (!window.confirm(`Cancel ${ids.length} visible entries?`)) return;
    try {
      await axios.patch(`${API_BASE}/cash-entries/bulk-cancel`, { ids });
      fetchData();
    } catch (err) {
      alert("Error cancelling entries: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div style={{ ...card, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Cash Book Report</h2>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
              Posted cash income and expense entries in the main cash book
            </p>
          </div>
          <button
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "default",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Posted Entries
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setReportView("active")}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: reportView === "active" ? "#dbeafe" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Active Entries
          </button>
          <button
            type="button"
            onClick={() => setReportView("cancelled")}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: reportView === "cancelled" ? "#fee2e2" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancelled Entries
          </button>
          {reportView === "active" ? (
            <button
              type="button"
              onClick={handleCancelAllVisible}
              style={{
                marginLeft: "auto",
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "#b91c1c",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Cancel All Visible
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ ...card, background: "linear-gradient(135deg, #ecfeff, #dbeafe)" }}>
          <div style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            Total Dr
          </div>
          <div style={{ color: "#0f172a", fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {summary.totalDr.toFixed(2)}
          </div>
        </div>
        <div style={{ ...card, background: "linear-gradient(135deg, #fff7ed, #fee2e2)" }}>
          <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            Total Cr
          </div>
          <div style={{ color: "#0f172a", fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {summary.totalCr.toFixed(2)}
          </div>
        </div>
        <div style={{ ...card, background: "linear-gradient(135deg, #ecfdf5, #dcfce7)" }}>
          <div style={{ color: "#15803d", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            Closing Balance
          </div>
          <div style={{ color: "#0f172a", fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            {summary.balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <select
          value={filters.warehouse_id}
          onChange={(e) => setFilters((prev) => ({ ...prev, warehouse_id: e.target.value }))}
          style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          value={filters.company_id}
          onChange={(e) => setFilters((prev) => ({ ...prev, company_id: e.target.value }))}
          style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        >
          <option value="">All Parties</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.employee_id}
          onChange={(e) => setFilters((prev) => ({ ...prev, employee_id: e.target.value }))}
          style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      <div style={card}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            Loading posted cash entries...
          </p>
        ) : filteredRows.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No entries posted in Cash Book yet
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Voucher</th>
                  <th style={th}>Type</th>
                  <th style={th}>Warehouse</th>
                  <th style={th}>Party</th>
                  <th style={th}>Employee</th>
                  <th style={th}>Description</th>
                  <th style={th}>Reference No</th>
                  <th style={th}>Payment Method</th>
                  <th style={{ ...th, textAlign: "right" }}>Dr</th>
                  <th style={{ ...th, textAlign: "right" }}>Cr</th>
                  <th style={{ ...th, textAlign: "right" }}>Balance</th>
                  <th style={{ ...th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((entry) => (
                  <tr key={entry.id}>
                    <td style={td}>{formatDisplayDate(entry.entry_date)}</td>
                    <td style={td}>{entry.voucher_no || "-"}</td>
                    <td style={{ ...td, textTransform: "capitalize" }}>{entry.entry_type || "-"}</td>
                    <td style={td}>{entry.warehouse_name || "-"}</td>
                    <td style={td}>{entry.company_name || "-"}</td>
                    <td style={td}>{entry.employee_name || "-"}</td>
                    <td style={td}>{entry.description || "-"}</td>
                    <td style={td}>{entry.reference_no || "-"}</td>
                    <td style={td}>{entry.payment_method || "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                      {entry.drAmount ? `Rs. ${entry.drAmount.toFixed(2)}` : "-"}
                    </td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                      {entry.crAmount ? `Rs. ${entry.crAmount.toFixed(2)}` : "-"}
                    </td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 700, color: "#0f766e" }}>
                      Rs. {entry.balance.toFixed(2)}
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CashEntryForm
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        formData={formData}
        onFormChange={handleFormChange}
        isEditMode={!!editingId}
        warehouses={warehouses}
        companies={companies}
        employees={employees}
        agingRows={agingRows}
        adjustments={adjustments}
        onAdjustmentChange={setAdjustments}
        loading={formLoading}
      />
    </div>
  );
}
