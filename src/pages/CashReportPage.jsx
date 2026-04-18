import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import ReportSectionToggles from "../components/ReportSectionToggles";
import { formatDisplayDate } from "../utils/date";

export default function CashReportPage() {
  const API_BASE = "/api";

  const [cashEntries, setCashEntries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseIds, setWarehouseIds] = useState([]);
  const [visibleSections, setVisibleSections] = useState(["opening", "ledger"]);

  useEffect(() => {
    fetchCashEntries();
    axios.get(`${API_BASE}/warehouses`).then((res) => setWarehouses(res.data || [])).catch(() => setWarehouses([]));
  }, []);

  const fetchCashEntries = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cash-entries`);
      setCashEntries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredEntries = useMemo(() => {
    return cashEntries.filter((item) => {
      const entryDate = new Date(item.entry_date);
      const fromOk = !dateFrom || entryDate >= new Date(dateFrom);
      const toOk = !dateTo || entryDate <= new Date(dateTo);
      const statusOk = !statusFilter || item.status === statusFilter;
      const warehouseOk = warehouseIds.length === 0 || warehouseIds.includes(String(item.warehouse_id || ""));

      const text = [item.voucher_no, item.company_name, item.description, item.reference_no, item.employee_name]
        .join(" ")
        .toLowerCase();

      return fromOk && toOk && statusOk && warehouseOk && text.includes(searchText.toLowerCase());
    });
  }, [cashEntries, dateFrom, dateTo, searchText, statusFilter, warehouseIds]);

  const openingBalance = useMemo(() => {
    let total = 0;
    const from = dateFrom ? new Date(dateFrom) : null;

    cashEntries.forEach((row) => {
      if (String(row.status).toLowerCase() === "cancelled") return;
      if (warehouseIds.length > 0 && !warehouseIds.includes(String(row.warehouse_id || ""))) return;

      const entryDate = new Date(row.entry_date);
      if (from && entryDate >= from) return;

      const amount = Number(row.amount || 0);
      total += String(row.entry_type).toLowerCase() === "income" ? amount : -amount;
    });

    return total;
  }, [cashEntries, dateFrom, warehouseIds]);

  const ledgerData = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    let running = openingBalance;

    return sorted.map((item) => {
      const amount = Number(item.amount || 0);
      const isIncome = String(item.entry_type).toLowerCase() === "income";
      running += isIncome ? amount : -amount;

      return {
        ...item,
        dr: isIncome ? amount : 0,
        cr: isIncome ? 0 : amount,
        balance: running,
      };
    });
  }, [filteredEntries, openingBalance]);

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0 }}>Cash Ledger Report</h2>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>Cash report ke ভাগ করে দিলাম, আর checkbox diye only selected part dekhabe.</p>
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ ...inputStyle, minWidth: 260 }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="posted">Posted</option>
          </select>
          <MultiSelectDropdown
            label="Warehouses"
            options={warehouses.map((item) => ({ value: String(item.id), label: item.name }))}
            value={warehouseIds}
            onChange={setWarehouseIds}
            placeholder="All Warehouses"
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <ReportSectionToggles
            title="Show Report Sections"
            value={visibleSections}
            onChange={setVisibleSections}
            options={[
              { key: "opening", label: "Opening Balance" },
              { key: "ledger", label: "Ledger Table" },
            ]}
          />
        </div>
      </div>

      {visibleSections.includes("ledger") ? (
        <div style={{ ...cardStyle, marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Voucher</th>
                <th style={th}>Warehouse</th>
                <th style={th}>Type</th>
                <th style={th}>Party</th>
                <th style={th}>Employee</th>
                <th style={th}>Description</th>
                <th style={th}>Dr</th>
                <th style={th}>Cr</th>
                <th style={th}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleSections.includes("opening") ? (
                <tr style={{ background: "#dbeafe", fontWeight: "bold" }}>
                  <td style={td}>{dateFrom ? formatDisplayDate(dateFrom) : "Start"}</td>
                  <td style={td}>-</td>
                  <td style={td}>-</td>
                  <td style={td}>Opening</td>
                  <td style={td}>-</td>
                  <td style={td}>-</td>
                  <td style={td}>Opening Balance</td>
                  <td style={td}>-</td>
                  <td style={td}>-</td>
                  <td style={{ ...td, fontWeight: "bold" }}>Rs. {openingBalance.toFixed(2)}</td>
                </tr>
              ) : null}
              {ledgerData.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{formatDisplayDate(item.entry_date)}</td>
                  <td style={td}>{item.voucher_no || "-"}</td>
                  <td style={td}>{item.warehouse_name || "-"}</td>
                  <td style={td}>{item.entry_type}</td>
                  <td style={td}>{item.company_name || "-"}</td>
                  <td style={td}>{item.employee_name || "-"}</td>
                  <td style={td}>{item.description || "-"}</td>
                  <td style={td}>{item.dr ? `Rs. ${item.dr.toFixed(2)}` : "-"}</td>
                  <td style={td}>{item.cr ? `Rs. ${item.cr.toFixed(2)}` : "-"}</td>
                  <td style={{ ...td, fontWeight: 600 }}>Rs. {item.balance.toFixed(2)}</td>
                </tr>
              ))}
              {ledgerData.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ ...td, textAlign: "center" }}>No cash entries found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
};

const th = {
  background: "#0f766e",
  color: "#fff",
  padding: "10px",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
};
