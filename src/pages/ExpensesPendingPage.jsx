import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDisplayDate } from "../utils/date";

export default function ExpensesPendingPage() {
  const API_BASE = "/api";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingExpenses, setPendingExpenses] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/cash-entries?status=pending&entry_type=expense`
      );
      setPendingExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching pending expenses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostEntry = async (id) => {
    if (!window.confirm("Post this entry to Cash Book?")) return;
    try {
      await axios.patch(`${API_BASE}/cash-entries/${id}`, { status: "posted" });
      alert("Entry posted successfully!");
      fetchData();
    } catch (err) {
      alert("Error posting entry: " + (err.response?.data?.error || err.message));
    }
  };

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
            <h2 style={{ margin: 0, color: "#0f172a" }}>Expenses Pending</h2>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
              Pending cash entries waiting to be posted to Cash Book
            </p>
          </div>
          <button
            onClick={() => navigate("/cash-entries")}
            style={{
              padding: "8px 16px",
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + New Cash Entry
          </button>
        </div>
      </div>

      <div style={card}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            Loading pending expenses...
          </p>
        ) : pendingExpenses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No pending expense entries found
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Voucher</th>
                  <th style={th}>Warehouse</th>
                  <th style={th}>Party</th>
                  <th style={th}>Description</th>
                  <th style={th}>Reference No</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingExpenses.map((entry) => (
                  <tr key={entry.id}>
                    <td style={td}>{formatDisplayDate(entry.entry_date)}</td>
                    <td style={td}>{entry.voucher_no || "-"}</td>
                    <td style={td}>{entry.warehouse_name || "-"}</td>
                    <td style={td}>{entry.company_name || "-"}</td>
                    <td style={td}>{entry.description || "-"}</td>
                    <td style={td}>{entry.reference_no || "-"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                      Rs. {Number(entry.amount || 0).toFixed(2)}
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => handlePostEntry(entry.id)}
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Post Entry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
