import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 👈 i18n হুক ইম্পোর্ট
import { 
  LayoutDashboard, Users, Package, Settings,  
   UserPlus, Boxes, Briefcase, FileSpreadsheet, TrendingUp,Globe 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewSidebar = () => {
  const { t, i18n } = useTranslation(); // 👈 ট্রান্সলেশন ফাংশন
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
const [openSubMenus, setOpenSubMenus] = useState({});
  const navigate = useNavigate();

  // 🌐 ভাষা পরিবর্তন করার ফাংশন / Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // 📂 ডাইনামিক মেনু আইটেম লিস্ট (t ফাংশন দিয়ে ডাইনামিক করা)
  const menuItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { 
      name: t('employees'), icon: Users, path: '/employees', hasSubMenu: true,
      subMenuItems: [
        { name: t('all_employees'), icon: Users, path: '/employees/all' },
        { name: t('add_employee'), icon: UserPlus, path: '/employees/add' },
      ]
    },
    { 
      name: t('inventory'), icon: Package, path: '/inventory', hasSubMenu: true,
      subMenuItems: [
        { name: t('stock_overview'), icon: Boxes, path: '/inventory/stock' },
      ]
    },
    { name: t('dealer'), icon: Briefcase, path: '/dealer', hasSubMenu: false },
    { name: t('invoice_accounting'), icon: FileSpreadsheet, path: '/accounting', hasSubMenu: false },
    { name: t('marketing_sales'), icon: TrendingUp, path: '/sales', hasSubMenu: false },
    { name: t('settings'), icon: Settings, path: '/settings' },
  ];

  const toggleSubMenu = (menuName) => {
    if (!isOpen) setIsOpen(true); 
    setOpenSubMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className={`h-full bg-brand-dark text-white p-5 flex flex-col justify-between transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
        <div>
          {/* লোগো অংশ / Logo Section */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-brand-dark text-xl">JS</div>
              {isOpen && <span className="font-extrabold text-lg text-slate-100">JSTR <span className="text-brand">GLOBAL</span></span>}
            </div>
          </div>

          {/* 🌐 ভাষা পরিবর্তনকারী বাটন / Language Switcher Toggle */}
          {isOpen && (
            <div className="flex gap-2 mb-4 p-2 bg-slate-900 rounded-lg justify-center items-center">
              <Globe size={16} className="text-brand" />
              <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs rounded ${i18n.language === 'bn' ? 'bg-brand text-brand-dark font-bold' : 'text-slate-400'}`}>বাংলা</button>
            </div>
          )}

          {/* মেনু রেন্ডারিং / Menu Rendering */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.name} onClick={() => { setActiveTab(item.name); if (item.hasSubMenu) toggleSubMenu(item.name); else navigate(item.path); }} className="w-full flex items-center justify-between p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {isOpen && <span className="text-sm">{item.name}</span>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 🖥️ মেইন কন্টেন্ট এরিয়া / Main Content Area */}
      <main className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{activeTab}</h1>
          <p className="text-sm text-slate-500">{t('welcome')}</p> {/* 👈 ডাইনামিক টেক্সট */}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
            <h3 className="text-sm font-semibold mb-2">{t('total_employees')}</h3>
            <p className="text-3xl font-bold">128</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
            <h3 className="text-sm font-semibold mb-2">{t('active_products')}</h3>
            <p className="text-3xl font-bold">1,420</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
            <h3 className="text-sm font-semibold mb-2">{t('system_status')}</h3>
            <p className="text-3xl font-bold text-emerald-500">{t('optimal')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewSidebar;
