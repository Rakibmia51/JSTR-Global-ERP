// import { useState } from 'react';
// import { useTranslation } from 'react-i18next'; // 👈 i18n হুক ইম্পোর্ট
// import { 
//   LayoutDashboard, 
//   Users, 
//   // Package, 
//   Settings, 
//   LogOut, 
//   Menu, 
//   X, 
//   ChevronRight,
//   ChevronDown,
//   UserPlus,
//   Building2,
//   Boxes,
//   // PlusCircle,
//   Briefcase,      // Dealer আইকন
//   FileSpreadsheet, // Invoice & Accounting আইকন
//   TrendingUp,     // Marketing & Sales আইকন
//   FilePlus,       // Create Invoice
//   History,        // History
//   DollarSign,     // Expense
//   PieChart,       // Reports
//   Target,         // Leads
//   Megaphone,       // Campaigns
//   Globe,
//   Package,
//   PlusCircle,
//   Network
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const Sidebar = () => {
//   const { t, i18n } = useTranslation(); // 👈 ট্রান্সলেশন ফাংশন
//   const [isOpen, setIsOpen] = useState(true);
//   const [activeTab, setActiveTab] = useState('Dashboard');
//   const [openSubMenus, setOpenSubMenus] = useState({}); 
//   const navigate = useNavigate();

//     // 🌐 ভাষা পরিবর্তন করার ফাংশন / Function to change language
//   const changeLanguage = (lng) => {
//     i18n.changeLanguage(lng);
//   };

//   // 📂 সাব-মেনুসহ সম্পূর্ণ ERP মেনু আইটেম লিস্ট
//   const menuItems = [
//     { 
//       name: t('dashboard'), 
//       icon: LayoutDashboard,
//       path: '/admin-panel'
//     },
//     { 
//       name: t('employees'), 
//       icon: Users,
//       path: '/admin-panel/employees',
//       hasSubMenu: true,
//       subMenuItems: [
//         { name: t('all_employees'), icon: Users, path: '/admin-panel/employees/all' },
//         { name: t('tree_employees'), icon: Network, path: '/admin-panel/employees/tree' },
//         { name: t('add_employee'), icon: UserPlus, path: '/admin-panel/employees/add' },
//         { name: t('departments'), icon: Building2, path: '/admin-panel/employees/departments' },
//       ]
//     },
//     { 
//       name: t('inventory'), 
//       icon: Package,
//       path: '/admin-panel/inventory',
//       hasSubMenu: true,
//       subMenuItems: [
//         { name: t('stock_overview'), icon: Boxes, path: '/admin-panel/inventory/stock' },
//         { name: t('add_new_item'), icon: PlusCircle, path: '/admin-panel/inventory/add' },
//         { name: t('suppliers'), icon: Users, path: '/admin-panel/inventory/suppliers' },
//       ]
//     },
//     { 
//       // 🤝 নতুন মডিউল: Dealer
//       name: t('dealer'), 
//       icon: Briefcase,
//       path: '/admin-panel/dealer',
//       hasSubMenu: true,
//       subMenuItems: [
//         { name: t('all_dealers'), icon: Users, path: '/admin-panel/dealer/all' },
//         { name: t('add_new_dealer'), icon: UserPlus, path: '/admin-panel/dealer/add' },
//         // { name: t('dealer_orders'), icon: Boxes, path: '/admin-panel/dealer/orders' },
//       ]
//     },
//     { 
//       // 📊 নতুন মডিউল: Invoice & Accounting
//       name: t('invoice_accounting'), 
//       icon: FileSpreadsheet,
//       path: '/admin-panel/accounting',
//       hasSubMenu: true,
//       subMenuItems: [
//         { name: t('create_invoice'), icon: FilePlus, path: '/admin-panel/accounting/create-invoice' },
//         { name: t('invoice_history'), icon: History, path: '/admin-panel/accounting/history' },
//         { name: t('expense_tracker'), icon: DollarSign, path: '/admin-panel/accounting/expenses' },
//         { name: t('financial_reports'), icon: PieChart, path: '/admin-panel/accounting/reports' },
//       ]
//     },
//     { 
//       // 📈 নতুন মডিউল: Marketing & Sales
//       name: t('marketing_sales'), 
//       icon: TrendingUp,
//       path: '/admin-panel/sales',
//       hasSubMenu: true,
//       subMenuItems: [
//         { name: t('sales_forecast'), icon: TrendingUp, path: '/admin-panel/sales/forecast' },
//         { name: t('commission_payouts'), icon: Target, path: '/admin-panel/sales/commission' },
//         { name: t('campaigns'), icon: Megaphone, path: '/admin-panel/sales/campaigns' },
//       ]
//     },
//     { 
//       name: t('settings'), 
//       icon: Settings,
//       path: '/admin-panel/settings'
//     },
//   ];

//   const toggleSubMenu = (menuName) => {
//     if (!isOpen) setIsOpen(true); 
//     setOpenSubMenus(prev => ({
//       ...prev,
//       [menuName]: !prev[menuName]
//     }));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token'); 
//     localStorage.removeItem('userRole'); 
//     navigate('/login', { replace: true }); 
//   };

//   return (
//     <div className="flex h-screen bg-slate-50 font-sans">
//       <button 
//         className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand rounded-md text-brand-dark"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       <aside className={`
//         fixed md:sticky top-0 left-0 z-40
//         h-full bg-brand-dark text-white p-5 
//         flex flex-col justify-between transition-all duration-300
//         ${isOpen ? 'w-64' : 'w-20'} 
//         ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//       `}>
        
//         {/* উপরের অংশ: লোগো ও ব্র্যান্ড নেম */}
//         <div className="overflow-y-auto pr-1 select-none scrollbar-thin">
//           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
//             <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-brand-dark text-xl shadow-[0_0_15px_rgba(75,203,250,0.5)] flex-shrink-0">
//               JS
//             </div>
//             {isOpen && (
//               <span className="font-extrabold text-lg tracking-wider text-slate-100">
//                 JSTR <span className="text-brand">Global</span>
//               </span>
//             )}
//           </div>

            
//           {/* 🌐 ভাষা পরিবর্তনকারী বাটন / Language Switcher Toggle */}
//           {isOpen && (
//             <div className="flex gap-2 mb-4 p-2 bg-slate-900 rounded-lg justify-center items-center">
//               <Globe size={16} className="text-brand" />
//               <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>EN</button>
//               <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'bn' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>বাংলা</button>
//             </div>
//           )}

//           {/* মেনু আইটেম লিস্ট */}
//           <nav className="space-y-2">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activeTab === item.name || activeTab.startsWith(`${item.name} -`);
//               const isSubMenuOpen = !!openSubMenus[item.name];

//               return (
//                 <div key={item.name} className="space-y-1">
//                   <button
//                     onClick={() => {
//                       setActiveTab(item.name);
//                       if (item.hasSubMenu) {
//                         toggleSubMenu(item.name);
//                       } else {
//                         navigate(item.path);
//                       }
//                     }}
//                     className={`
//                       w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
//                       ${isActive 
//                         ? 'bg-brand text-brand-dark font-bold shadow-lg' 
//                         : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
//                     `}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Icon size={20} className={isActive ? 'text-brand-dark' : 'group-hover:text-brand'} />
//                       {isOpen && <span className="text-sm">{item.name}</span>}
//                     </div>
                    
//                     {isOpen && item.hasSubMenu && (
//                       isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
//                     )}
//                     {isOpen && !item.hasSubMenu && isActive && <ChevronRight size={16} />}
//                   </button>

//                   {/* 🔽 সাব-মেনু আইটেম লিস্ট */}
//                   {isOpen && item.hasSubMenu && isSubMenuOpen && (
//                     <div className="pl-6 space-y-1 border-l border-slate-800 ml-5 my-1">
//                       {item.subMenuItems.map((subItem) => {
//                         const SubIcon = subItem.icon;
//                         const isSubActive = activeTab === `${item.name} - ${subItem.name}`;
//                         return (
//                           <button
//                             key={subItem.name}
//                             onClick={() => {
//                               setActiveTab(`${item.name} - ${subItem.name}`);
//                               navigate(subItem.path);
//                             }}
//                             className={`w-full flex items-center gap-3 p-2 text-xs rounded-lg transition-all duration-150 text-left
//                               ${isSubActive ? 'text-brand font-medium' : 'text-slate-400 hover:text-white'}`}
//                           >
//                             <SubIcon size={14} />
//                             <span>{subItem.name}</span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//         </div>

//         {/* নিচের অংশ: ইউজার প্রোফাইল ও লগআউট বাটন */}
//         <div className="border-t border-slate-800 pt-4 space-y-4 bg-brand-dark">
//           {isOpen && (
//             <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg">
//               <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-brand-dark font-bold flex-shrink-0">
//                 A
//               </div>
//               <div className="overflow-hidden">
//                 <h4 className="text-sm font-semibold truncate">Abir Hasan</h4>
//                 <p className="text-xs text-slate-500 truncate">admin@jstr-erp.com</p>
//               </div>
//             </div>
//           )}
          
//           <button className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
//             onClick={handleLogout}
//           >
//             <LogOut size={20} />
//             {isOpen && <span className="font-medium">{t("Logout")}</span>}
//           </button>
//         </div>

//       </aside>

//     </div>
//   );
// };

// export default Sidebar;





import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ChevronDown,
  UserPlus,
  Building2,
  Boxes,
  Briefcase,      
  FileSpreadsheet, 
  TrendingUp,     
  FilePlus,       
  History,        
  DollarSign,     
  PieChart,       
  Target,         
  Megaphone,      
  Globe,
  Package,
  PlusCircle,
  Network,
  // 🆕 নতুন আইকনসমূহ
  Wallet,
  Award,
  // Layers,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [openSubMenus, setOpenSubMenus] = useState({}); 
  const navigate = useNavigate();

  // 🔑 লোকাল স্টোরেজ থেকে কারেন্ট ইউজারের রোল রিড করা (Admin / Employee / Dealer)
  const userRole = localStorage.getItem('userRole') || 'admin'; 
  const userIdNo = localStorage.getItem('userIdNo') || '';
  const userDept = localStorage.getItem('userDepartmentCode') || 'MKT';


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // 📂 রোল-ভিত্তিক সম্পূর্ণ ডাইনামিক মেনু লিস্ট
  const menuItems = [
    // ---------------- ADMIN MODULES ----------------
    { 
      name: t('dashboard'), 
      id: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin-panel',
      roles: ['admin'] 
    },
    { 
      name: t('employees'), 
      id: 'Employees',
      icon: Users,
      path: '/admin-panel/employees',
      hasSubMenu: true,
      roles: ['admin'],
      subMenuItems: [
        { name: t('all_employees'), id: 'All Employees', icon: Users, path: '/admin-panel/employees/all' },
        { name: t('tree_employees'), id: 'Tree Employees', icon: Network, path: '/admin-panel/employees/tree' },
        { name: t('add_employee'), id: 'Add Employee', icon: UserPlus, path: '/admin-panel/employees/add' },
        { name: t('departments'), id: 'Departments', icon: Building2, path: '/admin-panel/employees/departments' },
      ]
    },
    { 
      name: t('inventory'), 
      id: 'Inventory',
      icon: Package,
      path: '/admin-panel/inventory',
      hasSubMenu: true,
      roles: ['admin'],
      subMenuItems: [
        { name: t('stock_overview'), id: 'Stock Overview', icon: Boxes, path: '/admin-panel/inventory/stock' },
        { name: t('add_new_item'), id: 'Add New Item', icon: PlusCircle, path: '/admin-panel/inventory/add' },
        { name: t('suppliers'), id: 'Suppliers', icon: Users, path: '/admin-panel/inventory/suppliers' },
      ]
    },
    { 
      name: t('dealer'), 
      id: 'Dealer',
      icon: Briefcase,
      path: '/admin-panel/dealer',
      hasSubMenu: true,
      roles: ['admin'],
      subMenuItems: [
        { name: t('all_dealers'), id: 'All Dealers', icon: Users, path: '/admin-panel/dealer/all' },
        { name: t('add_new_dealer'), id: 'Add New Dealer', icon: UserPlus, path: '/admin-panel/dealer/add' },
      ]
    },
    { 
      name: t('invoice_accounting'), 
      id: 'Invoice & Accounting',
      icon: FileSpreadsheet,
      path: '/admin-panel/accounting',
      hasSubMenu: true,
      roles: ['admin'],
      subMenuItems: [
        { name: t('create_invoice'), id: 'Create Invoice', icon: FilePlus, path: '/admin-panel/accounting/create-invoice' },
        { name: t('invoice_history'), id: 'Invoice History', icon: History, path: '/admin-panel/accounting/history' },
        { name: t('expense_tracker'), id: 'Expense Tracker', icon: DollarSign, path: '/admin-panel/accounting/expenses' },
        { name: t('financial_reports'), id: 'Financial Reports', icon: PieChart, path: '/admin-panel/accounting/reports' },
      ]
    },
    { 
      name: t('marketing_sales'), 
      id: 'Marketing & Sales',
      icon: TrendingUp,
      path: '/admin-panel/sales',
      hasSubMenu: true,
      roles: ['admin'],
      subMenuItems: [
        { name: t('sales_forecast'), id: 'Sales Forecast', icon: TrendingUp, path: '/admin-panel/sales/forecast' },
        { name: t('commission_payouts'), id: 'Commission Payouts', icon: Target, path: '/admin-panel/sales/commission' },
        { name: t('campaigns'), id: 'Campaigns', icon: Megaphone, path: '/admin-panel/sales/campaigns' },
      ]
    },
    

    // ---------------- 🆕 EMPLOYEE & DEALER MODULES ----------------
    { 
      name: t('employee_dashboard', 'Employee Dashboard'), 
      id: 'Employee Dashboard',
      icon: LayoutDashboard,
      path: '/employee-panel',
      roles: ['employee'],
      userDepartmentCode: ['MKT']
    },
    { 
      name: t('dealer_dashboard', 'Dealer Dashboard'), 
      id: 'Dealer Dashboard',
      icon: LayoutDashboard,
      path: '/dealer-panel',
      roles: ['dealer'] 
    },
    { 
      name: t('my_sales', 'My Sales'), 
      id: 'My Sales',
      icon: UserCheck,
      path: `/${userRole.toLowerCase()}-panel/my-sales`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে
      userDepartmentCode: ['MKT']
    },
    { 
      name: t('team_sales', 'Team Sales'), 
      id: 'Team Sales',
      icon: TrendingUp,
      path: `/${userRole.toLowerCase()}-panel/team-sales`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে,
      userDepartmentCode: ['MKT']
    },
    { 
      name: t('my_commission', 'My Commission'), 
      id: 'My Commission',
      icon: DollarSign,
      path: `/${userRole.toLowerCase()}-panel/commission`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে,
      userDepartmentCode: ['MKT'] 
    },
    { 
      name: t('wallet', 'Wallet'), 
      id: 'Wallet',
      icon: Wallet,
      path: `/${userRole.toLowerCase()}-panel/wallet`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে,
      userDepartmentCode: ['MKT'] 
    },
    { 
      name: t('downline_tree', 'Downline Tree'), 
      id: 'Downline Tree',
      icon: Network,
      path: `/${userRole.toLowerCase()}-panel/tree`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে,
      userDepartmentCode: ['MKT']
    },
    { 
      name: t('rank_progress', 'Rank Progress'), 
      id: 'Rank Progress',
      icon: Award,
      path: `/${userRole.toLowerCase()}-panel/rank`,
      roles: ['employee', 'dealer', 'admin'], // উভয়েই দেখতে পাবে,
      userDepartmentCode: ['MKT'] 
    },

    // ---------------- COMMON MODULES ----------------
    { 
      name: t('settings'), 
      id: 'Settings',
      icon: Settings,
      path: `/${userRole.toLowerCase()}-panel/settings`,
      roles: ['admin', 'employee', 'dealer'] 
    },
  ];

  // 🎯 ইউজারের রোল অনুযায়ী মেনু ফিল্টার করা
  //const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));


  // 🎯 ২. রোল এবং ডিপার্টমেন্ট কোড—উভয় কন্ডিশন চেক করে মেনু ফিল্টার করা
  const filteredMenuItems = menuItems.filter(item => {
    // ক) প্রথমে চেক করুন ইউজারের রোল এই মেনুর জন্য অনুমতিপ্রাপ্ত কিনা
    const hasRoleAccess = item.roles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
    
    // খ) যদি মেনুতে নির্দিষ্ট কোনো ডিপার্টমেন্ট কোড লক করা থাকে (যেমন: userDepartmentCode: ['MKT'])
    if (item.userDepartmentCode) {
      const hasDeptAccess = item.userDepartmentCode.map(d => d.toLowerCase()).includes(userDept.toLowerCase());
      return hasRoleAccess && hasDeptAccess; // রোল এবং ডিপার্টমেন্ট দুইটাই মিললে তবেই ট্রু হবে
    }

    // গ) যদি মেনুতে কোনো ডিপার্টমেন্টের বাধ্যবাধকতা না থাকে, তবে শুধু রোল মিললেই হবে
    return hasRoleAccess;
  });



  const toggleSubMenu = (menuId) => {
    if (!isOpen) setIsOpen(true); 
    setOpenSubMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('userIdNo');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDepartmentName');
    localStorage.removeItem('userDepartmentCode');
    navigate('/login', { replace: true }); 
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand rounded-md text-brand-dark"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        h-full bg-brand-dark text-white p-5 
        flex flex-col justify-between transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="overflow-y-auto pr-1 select-none scrollbar-thin flex-1">
          
          {/* 🔝 উপরের অংশ: লোগো, ব্র্যান্ড নেম এবং ডেস্কটপ টগল বাটন */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-brand-dark text-xl shadow-[0_0_15px_rgba(75,203,250,0.5)] flex-shrink-0">
                JS
              </div>
              {isOpen && (
                <span className="font-extrabold text-lg tracking-wider text-slate-100 whitespace-nowrap">
                  JSTR <span className="text-brand">Global</span>
                </span>
              )}
            </div>

            {/* 🔘 ডেস্কটপ টগল বাটন (শুধুমাত্র বড় স্ক্রিনে দেখাবে) */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {isOpen ? <Menu size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* 🌐 ভাষা পরিবর্তনকারী বাটন */}
          {isOpen && (
            <div className="flex gap-2 mb-4 p-2 bg-slate-900 rounded-lg justify-center items-center">
              <Globe size={16} className="text-brand" />
              <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'bn' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>বাংলা</button>
            </div>
          )}

          {/* ফিল্টারকৃত ডাইনামিক মেনু রেন্ডার */}
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSubMenuOpen = !!openSubMenus[item.id];

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (item.hasSubMenu) {
                        toggleSubMenu(item.id);
                      } else {
                        setActiveTab(item.id);
                        navigate(item.path);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-brand text-brand-dark font-bold shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isActive ? 'text-brand-dark' : 'group-hover:text-brand'} />
                      {isOpen && <span className="text-sm">{item.name}</span>}
                    </div>
                    
                    {isOpen && item.hasSubMenu && (
                      isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                    {isOpen && !item.hasSubMenu && isActive && <ChevronRight size={16} />}
                  </button>

                  {/* 🔽 সাব-মেনু আইটেম লিস্ট */}
                  {isOpen && item.hasSubMenu && isSubMenuOpen && (
                    <div className="pl-6 space-y-1 border-l border-slate-800 ml-5 my-1">
                      {item.subMenuItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeTab === subItem.id;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id);
                              navigate(subItem.path);
                            }}
                            className={`
                              w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200 group
                              ${isSubActive 
                                ? 'text-brand font-semibold' 
                                : 'text-slate-400 hover:text-white'}
                            `}
                          >
                            <SubIcon size={16} className={isSubActive ? 'text-brand' : 'group-hover:text-slate-200'} />
                            <span>{subItem.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* নিচের অংশ: প্রোফাইল এবং লগআউট বাটন */}
        <div className="pt-4 border-t border-slate-800 mt-auto space-y-4">
          
          {/* 👤 ডাইনামিক ইউজার প্রোফাইল কার্ড */}
          <div 
            onClick={() => navigate(`/${userRole.toLowerCase()}-panel/settings`)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand uppercase border border-slate-600 flex-shrink-0">
              {(localStorage.getItem('userName') || userRole).charAt(0)}
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-200 truncate">
                  {localStorage.getItem('userName') || 'User Name'}
                </span>
                <span className="text-xs text-brand font-medium">
                  {userRole}
                </span>
                <span className="text-xs text-brand font-medium">
                  {userIdNo ? `ID: ${userIdNo}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* 🚪 লগআউট বাটন */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            {isOpen && <span className="text-sm font-medium">{t('logout', 'Logout')}</span>}
          </button>
        </div>
      </aside>

    </div>
  );
};

export default Sidebar;

