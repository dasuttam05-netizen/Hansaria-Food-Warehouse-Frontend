import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mobile: "",
    opening_balance: "0",
    opening_balance_type: "dr",
  });
  const [editId, setEditId] = useState(null);

  const API_URL = "/api/companies";

  // 🔹 Fetch Companies
  const fetchCompanies = async () => {
    try {
      const res = await axios.get(API_URL);
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Save Company
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert("Company Name and Mobile No. are required");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        alert("Company updated successfully");
      } else {
        await axios.post(API_URL, formData);
        alert("Company added successfully");
      }
      setFormData({ name: "", address: "", mobile: "", opening_balance: "0", opening_balance_type: "dr" });
      setEditId(null);
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Error saving company");
    }
  };

  // 🔹 Edit Company
  const handleEdit = (comp) => {
    setFormData({
      name: comp.name,
      address: comp.address,
      mobile: comp.mobile,
      opening_balance: String(comp.opening_balance ?? 0),
      opening_balance_type: String(comp.opening_balance_type || "dr"),
    });
    setEditId(comp.id);
    setShowForm(true);
  };

  // 🔹 Delete Company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Error deleting company");
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>
        Company Management
      </h2>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#4caf50",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginBottom: "12px",
            fontSize: "14px",
          }}
        >
          Add Company
        </button>
      )}

      {/* 🔹 Popup Form */}
      {showForm && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.35)",
              zIndex: 999,
            }}
            onClick={() => setShowForm(false)}
          ></div>

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "18px",
              borderRadius: "14px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              width: "420px",
              maxWidth: "95%",
              zIndex: 1000,
              transition: "all 0.3s ease",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {editId ? "✏️ Edit Company" : "➕ New Company"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile No."
                  value={formData.mobile}
                  onChange={handleChange}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="number"
                  name="opening_balance"
                  placeholder="Opening Balance"
                  value={formData.opening_balance}
                  onChange={handleChange}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                  step="0.01"
                />
                <select
                  name="opening_balance_type"
                  value={formData.opening_balance_type || "dr"}
                  onChange={handleChange}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                >
                  <option value="dr">Dr</option>
                  <option value="cr">Cr</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    background: "#4caf50",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✅ Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", address: "", mobile: "", opening_balance: "0", opening_balance_type: "dr" });
                    setEditId(null);
                  }}
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 🔹 Companies Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr style={{ background: "#607d8b", color: "#fff", height: "32px" }}>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Company Name</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Address</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Mobile</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Opening Balance</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((comp) => (
            <tr key={comp.id} style={{ textAlign: "center", height: "28px" }}>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>{comp.id}</td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>{comp.name}</td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>{comp.address}</td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>{comp.mobile}</td>
              <td style={{ padding: "4px", border: "1px solid #ccc", textAlign: "right" }}>
                {Number(comp.opening_balance || 0).toFixed(2)} {String(comp.opening_balance_type || "dr").toUpperCase()}
              </td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>
                <button
                  onClick={() => handleEdit(comp)}
                  style={{
                    background: "#2196f3",
                    color: "#fff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "4px",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comp.id)}
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: "8px", textAlign: "center" }}>
                No companies found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
