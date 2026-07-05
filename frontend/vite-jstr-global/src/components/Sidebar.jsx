import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 👈 i18n হুক ইম্পোর্ট
import { 
  LayoutDashboard, 
  Users, 
  // Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ChevronDown,
  UserPlus,
  Building2,
  Boxes,
  // PlusCircle,
  Briefcase,      // Dealer আইকন
  FileSpreadsheet, // Invoice & Accounting আইকন
  TrendingUp,     // Marketing & Sales আইকন
  FilePlus,       // Create Invoice
  History,        // History
  DollarSign,     // Expense
  PieChart,       // Reports
  Target,         // Leads
  Megaphone,       // Campaigns
  Globe,
  Package,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { t, i18n } = useTranslation(); // 👈 ট্রান্সলেশন ফাংশন
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [openSubMenus, setOpenSubMenus] = useState({}); 
  const navigate = useNavigate();

    // 🌐 ভাষা পরিবর্তন করার ফাংশন / Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // 📂 সাব-মেনুসহ সম্পূর্ণ ERP মেনু আইটেম লিস্ট
  const menuItems = [
    { 
      name: t('dashboard'), 
      icon: LayoutDashboard,
      path: '/admin-panel'
    },
    { 
      name: t('employees'), 
      icon: Users,
      path: '/admin-panel/employees',
      hasSubMenu: true,
      subMenuItems: [
        { name: t('all_employees'), icon: Users, path: '/admin-panel/employees/all' },
        { name: t('add_employee'), icon: UserPlus, path: '/admin-panel/employees/add' },
        { name: t('departments'), icon: Building2, path: '/admin-panel/employees/departments' },
      ]
    },
    { 
      name: t('inventory'), 
      icon: Package,
      path: '/admin-panel/inventory',
      hasSubMenu: true,
      subMenuItems: [
        { name: t('stock_overview'), icon: Boxes, path: '/admin-panel/inventory/stock' },
        { name: t('add_new_item'), icon: PlusCircle, path: '/admin-panel/inventory/add' },
        { name: t('suppliers'), icon: Users, path: '/admin-panel/inventory/suppliers' },
      ]
    },
    { 
      // 🤝 নতুন মডিউল: Dealer
      name: t('dealer'), 
      icon: Briefcase,
      path: '/admin-panel/dealer',
      hasSubMenu: true,
      subMenuItems: [
        { name: t('all_dealers'), icon: Users, path: '/admin-panel/dealer/all' },
        { name: t('add_new_dealer'), icon: UserPlus, path: '/admin-panel/dealer/add' },
        // { name: t('dealer_orders'), icon: Boxes, path: '/admin-panel/dealer/orders' },
      ]
    },
    { 
      // 📊 নতুন মডিউল: Invoice & Accounting
      name: t('invoice_accounting'), 
      icon: FileSpreadsheet,
      path: '/admin-panel/accounting',
      hasSubMenu: true,
      subMenuItems: [
        { name: t('create_invoice'), icon: FilePlus, path: '/admin-panel/accounting/create-invoice' },
        { name: t('invoice_history'), icon: History, path: '/admin-panel/accounting/history' },
        { name: t('expense_tracker'), icon: DollarSign, path: '/admin-panel/accounting/expenses' },
        { name: t('financial_reports'), icon: PieChart, path: '/admin-panel/accounting/reports' },
      ]
    },
    { 
      // 📈 নতুন মডিউল: Marketing & Sales
      name: t('marketing_sales'), 
      icon: TrendingUp,
      path: '/admin-panel/sales',
      hasSubMenu: true,
      subMenuItems: [
        { name: t('sales_forecast'), icon: TrendingUp, path: '/admin-panel/sales/forecast' },
        { name: t('lead_management'), icon: Target, path: '/admin-panel/sales/leads' },
        { name: t('campaigns'), icon: Megaphone, path: '/admin-panel/sales/campaigns' },
      ]
    },
    { 
      name: t('settings'), 
      icon: Settings,
      path: '/admin-panel/settings'
    },
  ];

  const toggleSubMenu = (menuName) => {
    if (!isOpen) setIsOpen(true); 
    setOpenSubMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('userRole'); 
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
        
        {/* উপরের অংশ: লোগো ও ব্র্যান্ড নেম */}
        <div className="overflow-y-auto pr-1 select-none scrollbar-thin">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-brand-dark text-xl shadow-[0_0_15px_rgba(75,203,250,0.5)] flex-shrink-0">
              JS
            </div>
            {isOpen && (
              <span className="font-extrabold text-lg tracking-wider text-slate-100">
                RAKIB <span className="text-brand">MIA</span>
              </span>
            )}
          </div>

            
          {/* 🌐 ভাষা পরিবর্তনকারী বাটন / Language Switcher Toggle */}
          {isOpen && (
            <div className="flex gap-2 mb-4 p-2 bg-slate-900 rounded-lg justify-center items-center">
              <Globe size={16} className="text-brand" />
              <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'bn' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>বাংলা</button>
            </div>
          )}

          {/* মেনু আইটেম লিস্ট */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name || activeTab.startsWith(`${item.name} -`);
              const isSubMenuOpen = !!openSubMenus[item.name];

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.hasSubMenu) {
                        toggleSubMenu(item.name);
                      } else {
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
                        const isSubActive = activeTab === `${item.name} - ${subItem.name}`;
                        return (
                          <button
                            key={subItem.name}
                            onClick={() => {
                              setActiveTab(`${item.name} - ${subItem.name}`);
                              navigate(subItem.path);
                            }}
                            className={`w-full flex items-center gap-3 p-2 text-xs rounded-lg transition-all duration-150 text-left
                              ${isSubActive ? 'text-brand font-medium' : 'text-slate-400 hover:text-white'}`}
                          >
                            <SubIcon size={14} />
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

        {/* নিচের অংশ: ইউজার প্রোফাইল ও লগআউট বাটন */}
        <div className="border-t border-slate-800 pt-4 space-y-4 bg-brand-dark">
          {isOpen && (
            <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-brand-dark font-bold flex-shrink-0">
                A
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold truncate">Abir Hasan</h4>
                <p className="text-xs text-slate-500 truncate">admin@jstr-erp.com</p>
              </div>
            </div>
          )}
          
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {isOpen && <span className="font-medium">{t("Logout")}</span>}
          </button>
        </div>

      </aside>

      {/* 🖥️ ডানপাশের মেইন কন্টেন্ট এরিয়া
      <main className="flex-1 p-8 overflow-y-auto mt-14 md:mt-0">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{activeTab} Overview</h1>
            <p className="text-sm text-text-secondary">Welcome back to JSTR Global ERP panel.</p>
          </div>
        </header>

        ডেমো ড্যাশবোর্ড কন্টেন্ট
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-erp-card border border-slate-100">
            <h3 className="text-text-secondary text-sm font-semibold mb-2">Total Employees</h3>
            <p className="text-3xl font-bold text-text-primary">128</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-erp-card border border-slate-100">
            <h3 className="text-text-secondary text-sm font-semibold mb-2">Active Products</h3>
            <p className="text-3xl font-bold text-text-primary">1,420</p>
          </div>



          <div className="bg-white p-6 rounded-2xl shadow-erp-card border border-slate-100">
            <h3 className="text-text-secondary text-sm font-semibold mb-2">System Status</h3>
            <p className="text-3xl font-bold text-emerald-500">Optimal</p>
          </div>
        </div>
      </main> */}

    </div>
  );
};

export default Sidebar;
