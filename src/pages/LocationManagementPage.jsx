import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LocationManagementPage() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [editId, setEditId] = useState(null);

  const API_URL = "/api/locations";

  // 🔹 Fetch Locations
  const fetchLocations = async () => {
    try {
      const res = await axios.get(API_URL);
      setLocations(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch locations");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Save Location
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      alert("Name and Address are required");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        alert("Location updated successfully");
      } else {
        await axios.post(API_URL, formData);
        alert("Location added successfully");
      }
      setFormData({ name: "", address: "" });
      setEditId(null);
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      console.error(err);
      alert("Error saving location");
    }
  };

  // 🔹 Edit Location
  const handleEdit = (loc) => {
    setFormData({ name: loc.name, address: loc.address });
    setEditId(loc.id);
    setShowForm(true);
  };

  // 🔹 Delete Location
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchLocations();
    } catch (err) {
      console.error(err);
      alert("Error deleting location");
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>
        Location Management
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
           Add Location
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
              width: "400px",
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
              {editId ? " Edit Location" : " New Location"}
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
                  placeholder="Location Name"
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
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
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
                    setFormData({ name: "", address: "" });
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

      {/* 🔹 Locations Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr
            style={{ background: "#607d8b", color: "#fff", height: "32px" }}
          >
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Name</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>
              Address
            </th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id} style={{ textAlign: "center", height: "28px" }}>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>
                {loc.id}
              </td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>
                {loc.name}
              </td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>
                {loc.address}
              </td>
              <td style={{ padding: "4px", border: "1px solid #ccc" }}>
                <button
                  onClick={() => handleEdit(loc)}
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
                  onClick={() => handleDelete(loc.id)}
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
          {locations.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: "8px", textAlign: "center" }}>
                No locations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
