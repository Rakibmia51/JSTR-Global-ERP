
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
import DealerList from './components/DealerList';
import DealerForm from './components/DealerForm';
import UpdateDealer from './components/UpdateDealer';
import ViewDealer from './components/ViewDealer';
import InvoiceForm from './components/InvoiceForm';
import ProductForm from './components/ProductForm';
import ComingSoon from './components/ComingSoon';
import TaskDashboard from './components/TaskDashboard';
import InvoiceProductSearch from './components/ExampleInvoice';
import InvoiceAndChallan from './components/InvoiceAndChallan';
import InvoiceHistoryTable from './components/InvoiceHistory';
import EmployeeTree from './components/EmployeeTree';



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

          <Route path="/admin-panel" element={<TaskDashboard/>} />
             {/* 👥 Employees Modules */}
          <Route path="employees/all" element={<EmployeeList/>} />
          <Route path="employees/tree" element={<EmployeeTree/>} />
          <Route path="employees/add" element={<AddEmployee/>} />
          {/* 🚀 ডাইনামিক আইডি রুট (অত্যন্ত গুরুত্বপূরণ) */}
          <Route path="/admin-panel/employees/view/:id" element={<ViewEmployee />} />
          <Route path="/admin-panel/employees/edit/:id" element={<EditEmployeePage/>} />
          <Route path="employees/departments" element={<DepartmentPanel/>} />

          {/* 📦 Inventory Modules */}
          <Route path="inventory/stock" element={<ComingSoon/>} />
          <Route path="inventory/add" element={<ProductForm/>} />
          <Route path="inventory/suppliers" element={<ComingSoon/>} />

          {/* 🤝 Dealer Modules */}
          <Route path="dealer/all" element={<DealerList/>} />
          <Route path="dealer/add" element={<DealerForm/>} />
          <Route path="/admin-panel/dealers/view/:id" element={<ViewDealer/>} />
          <Route path="/admin-panel/dealers/edit/:id" element={<UpdateDealer/>} />
          <Route path="dealer/orders" element={<ComingSoon/>} />

          {/* 📊 Invoice & Accounting Modules */}
          <Route path="accounting/create-invoice" element={<InvoiceForm/>} />
          <Route path="/admin-panel/accounting/update-invoice/:id" element={<InvoiceForm/>} />
          <Route path="accounting/history" element={<InvoiceHistoryTable/>} />
          <Route path="accounting/expenses" element={<InvoiceAndChallan/>} />
          <Route path="accounting/reports" element={<ComingSoon/>} />

          {/* 📈 Marketing & Sales Modules */}
          <Route path="sales/forecast" element={<ComingSoon/>} />
          <Route path="sales/leads" element={<ComingSoon/>} />
          <Route path="sales/campaigns" element={<ComingSoon/>} />

          {/* ⚙️ Settings */}
          <Route path="settings" element={<ComingSoon/>} />

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
