
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmployeeList from './components/EmployeeList';
import AddEmployee from './components/AddEmployee';
import DepartmentPanel from './components/DepartmentPanel';
import ViewEmployee from './components/ViewEmployee';
import EditEmployeePage from './components/EditEmployeePage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      

        {/* অ্যাডমিন প্যানেল প্রটেক্টেড: লগইন প্লাস শুধুমাত্র 'admin' রোল লাগবে */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard/>
            </ProtectedRoute>
          }>

             {/* 👥 Employees Modules */}
          <Route path="employees/all" element={<EmployeeList/>} />
          <Route path="employees/add" element={<AddEmployee/>} />
          {/* 🚀 ডাইনামিক আইডি রুট (অত্যন্ত গুরুত্বপূরণ) */}
          <Route path="/admin-panel/employees/view/:id" element={<ViewEmployee />} />
          <Route path="/admin-panel/employees/edit/:id" element={<EditEmployeePage/>} />
          
          <Route path="employees/departments" element={<DepartmentPanel/>} />

          {/* 📦 Inventory Modules */}
          <Route path="inventory/stock" element={<h5>Stock Overview</h5>} />
          <Route path="inventory/add" element={<h5>Add New Item</h5>} />
          <Route path="inventory/suppliers" element={<h5>Suppliers</h5>} />

          {/* 🤝 Dealer Modules */}
          <Route path="dealer/all" element={<h5>All Dealers</h5>} />
          <Route path="dealer/add" element={<h5>Add New Dealer</h5>} />
          <Route path="dealer/orders" element={<h5>Dealer Orders</h5>} />

          {/* 📊 Invoice & Accounting Modules */}
          <Route path="accounting/create-invoice" element={<h5>Create Invoice</h5>} />
          <Route path="accounting/history" element={<h5>Invoice History</h5>} />
          <Route path="accounting/expenses" element={<h5>Expense Tracker</h5>} />
          <Route path="accounting/reports" element={<h5>Financial Reports</h5>} />

          {/* 📈 Marketing & Sales Modules */}
          <Route path="sales/forecast" element={<h5>Sales Forecast</h5>} />
          <Route path="sales/leads" element={<h5>Lead Management</h5>} />
          <Route path="sales/campaigns" element={<h5>Campaigns</h5>} />

          {/* ⚙️ Settings */}
          <Route path="settings" element={<h5>Settings</h5>} />

        </Route>
      
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Sidebar/>
            </ProtectedRoute>
          } 
        />
      </Routes>

      
    </Router>
  );
}

export default App;
