import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CompanyAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "",
    address: "",
    company_id: "",
    pan_no: "",
    mobile: "",
  });
  const [editId, setEditId] = useState(null);

  const API_URL = "/api/company-accounts";
  const COMP_API = "/api/companies";

  // 🔹 Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(API_URL);
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch accounts");
    }
  };

  // 🔹 Fetch company list
  const fetchCompanies = async () => {
    try {
      const res = await axios.get(COMP_API);
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCompanies();
  }, []);

  // 🔹 Handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Save Account
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_name || !formData.company_id || !formData.pan_no || !formData.mobile) {
      alert("Account Name, Company, PAN & Mobile are required");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        alert("Account updated successfully");
      } else {
        await axios.post(API_URL, formData);
        alert("Account added successfully");
      }
      setFormData({ account_name: "", address: "", company_id: "", pan_no: "", mobile: "" });
      setEditId(null);
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Error saving account");
    }
  };

  // 🔹 Edit
  const handleEdit = (acc) => {
    setFormData({
      account_name: acc.account_name,
      address: acc.address,
      company_id: acc.company_id,
      pan_no: acc.pan_no,
      mobile: acc.mobile,
    });
    setEditId(acc.id);
    setShowForm(true);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>
        Company Account Management
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
          ➕ Add New Account
        </button>
      )}

      {/* 🔹 Popup Modal */}
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
              {editId ? "✏️ Edit Account" : "➕ New Account"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <input
                  type="text"
                  name="account_name"
                  placeholder="Account Name *"
                  value={formData.account_name}
                  onChange={handleChange}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #bbb" }}
                />
                <textarea
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #bbb" }}
                />
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #bbb" }}
                >
                  <option value="">Select Company *</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="pan_no"
                  placeholder="PAN No *"
                  value={formData.pan_no}
                  onChange={handleChange}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #bbb" }}
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile No *"
                  value={formData.mobile}
                  onChange={handleChange}
                  style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #bbb" }}
                />
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
                  }}
                >
                  ✅ Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ account_name: "", address: "", company_id: "", pan_no: "", mobile: "" });
                    setEditId(null);
                  }}
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 🔹 Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "15px" }}>
        <thead>
          <tr style={{ background: "#607d8b", color: "#fff" }}>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Account Name</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Company</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>PAN</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Mobile</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id} style={{ textAlign: "center" }}>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>{acc.id}</td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>{acc.account_name}</td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>{acc.company_name}</td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>{acc.pan_no}</td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>{acc.mobile}</td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                <button
                  onClick={() => handleEdit(acc)}
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
                  onClick={() => handleDelete(acc.id)}
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
          {accounts.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "10px", color: "#777" }}>
                No accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
