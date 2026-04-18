import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LocationManagementPage from "./pages/LocationManagementPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import CompanyManagementPage from "./pages/CompanyManagementPage";
import CompanyAccountsPage from "./pages/CompanyAccountsPage";
import WarehouseManagementPage from "./pages/WarehouseManagementPage";
import ProductsManagementPage from "./pages/ProductsManagementPage";
import InwardPage from "./pages/InwardPage";
import InwardReportPage from "./pages/InwardReportPage";
import OutwardPage from "./pages/OutwardPage";
import PendingAdjustment from "./pages/PendingAdjustment";
import ERPReportPage from "./pages/ERPReportPage";
import CashReportPage from "./pages/CashReportPage";
import ExpensesPendingPage from "./pages/ExpensesPendingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/locations" element={<LocationManagementPage />} />
        <Route path="/employees" element={<EmployeeManagementPage />} />
        <Route path="/companies" element={<CompanyManagementPage />} />
        <Route path="/company-accounts" element={<CompanyAccountsPage />} />
        <Route path="/warehouses" element={<WarehouseManagementPage />} />
        <Route path="/products" element={<ProductsManagementPage />} />
        <Route path="/inward" element={<InwardPage />} />
        <Route path="/inward-report" element={<InwardReportPage />} />
        <Route path="/outward" element={<OutwardPage />} />
        <Route path="/pending" element={<PendingAdjustment />} />
        <Route path="/erp-report" element={<ERPReportPage />} />
        <Route path="/cash-report" element={<CashReportPage />} />
        <Route path="/expenses-pending" element={<ExpensesPendingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
