import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

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
import PartyLedgerReportPage from "./pages/PartyLedgerReportPage";
import PartyStockReportPage from "./pages/PartyStockReportPage";
import WarehouseRentLedgerPage from "./pages/WarehouseRentLedgerPage";
import WarehouseRentDashboard from "./pages/WarehouseRentDashboard";
import OutwardSettlementReportPage from "./pages/OutwardSettlementReportPage";
import TransportManagementPage from "./pages/TransportManagementPage";
import TransportBiltiPage from "./pages/TransportBiltiPage";
import TransportReportPage from "./pages/TransportReportPage";
import ExpenseManagementPage from "./pages/ExpenseManagementPage";
import ExpenseReportPage from "./pages/ExpenseReportPage";
import CashEntriesPage from "./pages/CashEntriesPage";
import CashBookPage from "./pages/CashBookPage";
import ExpensesPendingPage from "./pages/ExpensesPendingPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { loadSession } from "./utils/auth";
import { getApiOrigin } from "./utils/api";

// ✅ ONLY ONE IMPORTANT LINE
axios.defaults.baseURL = getApiOrigin();

function AppRoutes() {
  useEffect(() => {
    loadSession();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute permission="dashboard.view">
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/locations"
        element={
          <ProtectedRoute permission="locations.manage">
            <LocationManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute permission="employees.view">
            <EmployeeManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies"
        element={
          <ProtectedRoute permission="companies.manage">
            <CompanyManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company-accounts"
        element={
          <ProtectedRoute permission="companyAccounts.manage">
            <CompanyAccountsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouses"
        element={
          <ProtectedRoute permission="warehouses.manage">
            <WarehouseManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute permission="products.manage">
            <ProductsManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inward"
        element={
          <ProtectedRoute permission={["inward.view", "inward.create", "inward.edit", "inward.delete"]}>
            <InwardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inward-report"
        element={
          <ProtectedRoute permission="report.inward">
            <InwardReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/outward"
        element={
          <ProtectedRoute permission={["outward.view", "outward.create", "outward.edit", "outward.delete"]}>
            <OutwardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pending"
        element={
          <ProtectedRoute permission="adjustment.manage">
            <PendingAdjustment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/erp-report"
        element={
          <ProtectedRoute permission="report.erp">
            <ERPReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/party-ledger-report"
        element={
          <ProtectedRoute permission="report.partyLedger">
            <PartyLedgerReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/party-stock-report"
        element={
          <ProtectedRoute permission="report.partyStock">
            <PartyStockReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse-rent-ledger"
        element={
          <ProtectedRoute permission="report.warehouseRentLedger">
            <WarehouseRentLedgerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse-rent-dashboard"
        element={
          <ProtectedRoute permission="report.warehouseRentMonthEnd">
            <WarehouseRentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/outward-settlement-report"
        element={
          <ProtectedRoute permission="report.outwardSettlement">
            <OutwardSettlementReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transport-management"
        element={
          <ProtectedRoute permission="transport.manage">
            <TransportManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transport-bilti"
        element={
          <ProtectedRoute permission="transport.manage">
            <TransportBiltiPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transport-report"
        element={
          <ProtectedRoute permission="transport.manage">
            <TransportReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute permission={["expense.view", "expense.create", "expense.edit", "expense.delete"]}>
            <ExpenseManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expense-report"
        element={
          <ProtectedRoute permission="report.expense">
            <ExpenseReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cash-entries"
        element={
          <ProtectedRoute permission={["cash.view", "cash.create", "cash.edit", "cash.delete"]}>
            <CashEntriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses-pending"
        element={
          <ProtectedRoute permission={["cash.view", "cash.create", "cash.edit", "cash.delete"]}>
            <ExpensesPendingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cash-book"
        element={
          <ProtectedRoute permission={["cash.view", "cash.create", "cash.edit", "cash.delete"]}>
            <CashBookPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
