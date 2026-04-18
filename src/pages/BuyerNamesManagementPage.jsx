import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MasterPartyDetailForm from "../components/MasterPartyDetailForm";

const emptyForm = () => ({
  name: "",
  mobile: "",
  email: "",
  address: "",
  gst_no: "",
  pan_no: "",
  state: "",
  location: "",
});

export default function BuyerNamesManagementPage() {
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("list");
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const API_URL = "/api/buyer-names";

  const fetchRows = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load buyers");
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goList = () => {
    setView("list");
    setEditId(null);
    setFormData(emptyForm());
  };

  const goAdd = () => {
    setEditId(null);
    setFormData(emptyForm());
    setView("form");
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData({
      name: row.name || "",
      mobile: row.mobile || "",
      email: row.email || "",
      address: row.address || "",
      gst_no: row.gst_no || "",
      pan_no: row.pan_no || "",
      state: row.state || "",
      location: row.location || "",
    });
    setView("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(formData.name || "").trim()) {
      alert("Name is required");
      return;
    }
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        alert("Buyer updated");
      } else {
        await axios.post(API_URL, formData);
        alert("Buyer saved");
      }
      goList();
      fetchRows();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this buyer?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRows();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const btnPrimary = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  };

  const card = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "960px",
    margin: "0 auto",
    boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
  };

  if (view === "form") {
    return (
      <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", padding: "8px" }}>
        <div style={{ ...card, maxWidth: "1000px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, flex: 1, color: "#0f172a", fontSize: "18px" }}>
              {editId ? "Edit Buyer Details" : "Add Buyer Details"}
            </h2>
            <button type="button" onClick={goList} style={btnPrimary}>
              Back To Buyer List
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <MasterPartyDetailForm mode="buyer" formData={formData} onChange={handleChange} />
            <div style={{ display: "flex", gap: "12px", marginTop: "22px", flexWrap: "wrap" }}>
              <button type="submit" style={btnPrimary}>
                Save
              </button>
              <button type="button" onClick={goList} style={btnPrimary}>
                Back To Buyer List
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", padding: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Buyer names</h2>
        <button type="button" onClick={goAdd} style={{ ...btnPrimary, background: "#0f766e" }}>
          Add Buyer
        </button>
      </div>
      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#0f766e", color: "#fff" }}>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Mobile</th>
              <th style={th}>State</th>
              <th style={th}>GST</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                <td style={td}>{row.id}</td>
                <td style={td}>{row.name}</td>
                <td style={td}>{row.mobile || "—"}</td>
                <td style={td}>{row.state || "—"}</td>
                <td style={td}>{row.gst_no || "—"}</td>
                <td style={td}>
                  <button type="button" onClick={() => handleEdit(row)} style={{ ...mini, background: "#2563eb" }}>
                    Edit
                  </button>{" "}
                  <button type="button" onClick={() => handleDelete(row.id)} style={{ ...mini, background: "#dc2626" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: "center", padding: "20px" }}>
                  No buyers yet. Click Add Buyer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #0d5c56" };
const td = { padding: "8px", borderBottom: "1px solid #e2e8f0" };
const mini = { border: "none", color: "#fff", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 };
