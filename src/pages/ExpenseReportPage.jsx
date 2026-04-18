import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import ReportSectionToggles from "../components/ReportSectionToggles";
import { formatDisplayDate } from "../utils/date";

export default function ExpenseReportPage() {
  const API_BASE = "/api";
  const [expenses, setExpenses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchText, setSearchText] = useState("");
  const [warehouseIds, setWarehouseIds] = useState([]);
  const [visibleSections, setVisibleSections] = useState(["table"]);

  useEffect(() => {
    fetchExpenses();
    axios.get(`${API_BASE}/warehouses`).then((res) => setWarehouses(res.data || [])).catch(() => setWarehouses([]));
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/expenses`);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const dateOk = (!dateFrom || item.expense_date >= dateFrom) && (!dateTo || item.expense_date <= dateTo);
      const warehouseOk = warehouseIds.length === 0 || warehouseIds.includes(String(item.warehouse_id || ""));

      const haystack = [
        item.voucher_no,
        item.warehouse_name,
        item.employee_name,
        item.product_name,
        item.company_name,
        item.send_to_company_name,
        item.paid_by,
      ]
        .join(" ")
        .toLowerCase();

      return dateOk && warehouseOk && haystack.includes(searchText.toLowerCase());
    });
  }, [expenses, dateFrom, dateTo, searchText, warehouseIds]);

  const exportExcel = () => {
    const rows = filteredExpenses
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.voucher_no || ""}</td>
          <td>${formatDisplayDate(item.expense_date) || ""}</td>
          <td>${item.warehouse_name || ""}</td>
          <td>${item.employee_name || ""}</td>
          <td>${item.product_name || ""}</td>
          <td>${item.company_name || ""}</td>
          <td>${item.send_to_company_name || ""}</td>
          <td>${item.reg_lorry_no || ""}</td>
          <td>${item.paid_by || ""}</td>
          <td>${Number(item.grand_total || 0).toFixed(2)}</td>
          <td>${Number(item.total_expense_amount || 0).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #0f766e; color: white; }
          </style>
        </head>
        <body>
          <h2>Expense Report</h2>
          <table>
            <thead>
              <tr>
                <th>Sl No</th><th>Voucher</th><th>Date</th><th>Warehouse</th><th>Employee</th><th>Product</th>
                <th>Party</th><th>Send To</th><th>Reg Lorry</th><th>Paid By</th><th>Grand Total</th><th>Net Expense</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-report.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Expense Report</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
            Expense report ke tick-based view kore dilam. Warehouse multi-select o ache.
          </p>
        </div>
        <button onClick={exportExcel} style={exportButtonStyle}>
          Export Excel
        </button>
      </div>

      <div style={filterCardStyle}>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search voucher / warehouse / party / paid by"
          style={{ ...inputStyle, minWidth: "320px" }}
        />
        <MultiSelectDropdown
          label="Warehouses"
          options={warehouses.map((item) => ({ value: String(item.id), label: item.name }))}
          value={warehouseIds}
          onChange={setWarehouseIds}
          placeholder="All Warehouses"
        />
        <div style={{ flexBasis: "100%" }}>
          <ReportSectionToggles
            title="Show Report Sections"
            value={visibleSections}
            onChange={setVisibleSections}
            options={[{ key: "table", label: "Expense Table" }]}
          />
        </div>
      </div>

      {visibleSections.includes("table") ? (
        <div style={tableCardStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Sl No</th>
                  <th style={thStyle}>Voucher</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Warehouse</th>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Party</th>
                  <th style={thStyle}>Send To</th>
                  <th style={thStyle}>Reg Lorry</th>
                  <th style={thStyle}>Paid By</th>
                  <th style={thStyle}>Grand Total</th>
                  <th style={thStyle}>Net Expense</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((item, index) => (
                    <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.voucher_no}</td>
                      <td style={tdStyle}>{formatDisplayDate(item.expense_date)}</td>
                      <td style={tdStyle}>{item.warehouse_name || "-"}</td>
                      <td style={tdStyle}>{item.employee_name || "-"}</td>
                      <td style={tdStyle}>{item.product_name || "-"}</td>
                      <td style={tdStyle}>{item.company_name || "-"}</td>
                      <td style={tdStyle}>{item.send_to_company_name || "-"}</td>
                      <td style={tdStyle}>{item.reg_lorry_no || "-"}</td>
                      <td style={tdStyle}>{item.paid_by || "-"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>{Number(item.grand_total || 0).toFixed(2)}</td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{Number(item.total_expense_amount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" style={{ ...tdStyle, textAlign: "center" }}>
                      No expense report data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const pageStyle = {
  padding: "20px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "Segoe UI, Arial, sans-serif",
};

const headerStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  padding: "18px 20px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const filterCardStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  padding: "16px",
  marginBottom: "16px",
};

const tableCardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
};

const exportButtonStyle = {
  border: "none",
  background: "#0f766e",
  color: "#fff",
  borderRadius: "10px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 700,
};

const thStyle = {
  padding: "10px 10px",
  border: "1px solid #dbe4ea",
  background: "#0f766e",
  color: "#fff",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "9px 10px",
  border: "1px solid #e2e8f0",
};
