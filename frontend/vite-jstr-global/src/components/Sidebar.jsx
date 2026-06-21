import  { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();

  // নেভিগেশন আইটেমের লিস্ট (আপনার ERP-র জন্য)
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Employees', icon: Users },
    { name: 'Inventory', icon: Package },
    { name: 'Settings', icon: Settings },
  ];

  // 🚪 লগআউট ফাংশন
const handleLogout = () => {
  // ১. লোকাল স্টোরেজ থেকে ইউজারের টোকেন ও ইনফো মুছে ফেলা
  localStorage.removeItem('token'); 
  localStorage.removeItem('userRole'); 
  // ২. ইউজারকে রিডাইরেক্ট করে লগইন পেজে পাঠিয়ে দেওয়া
  navigate('/login', { replace: true }); 
};

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* 📱 মোবাইল স্ক্রিনের জন্য ওপেন/ক্লোজ বাটন */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand rounded-md text-brand-dark"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🏢 মেইন সাইডবার কন্টেইনার */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        h-full bg-brand-dark text-white p-5 
        flex flex-col justify-between transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* উপরের অংশ: লোগো ও ব্র্যান্ড নেম */}
        <div>
          <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-brand-dark text-xl shadow-[0_0_15px_rgba(75,203,250,0.5)]">
              JS
            </div>
            {isOpen && (
              <span className="font-extrabold text-lg tracking-wider text-slate-100">
                JSTR <span className="text-brand">GLOBAL</span>
              </span>
            )}
          </div>

          {/* মেনু আইটেম লিস্ট */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-brand text-brand-dark font-bold shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-brand-dark' : 'group-hover:text-brand'} />
                    {isOpen && <span>{item.name}</span>}
                  </div>
                  {isOpen && isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* নিচের অংশ: ইউজার প্রোফাইল ও লগআউট বাটন */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          {isOpen && (
            <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-brand-dark font-bold">
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
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

      </aside>

      {/* 🖥️ ডানপাশের মেইন কন্টেন্ট এরিয়া (যেখানে ড্যাশবোর্ডের মেইন কার্ডগুলো থাকবে) */}
      <main className="flex-1 p-8 overflow-y-auto mt-14 md:mt-0">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{activeTab} Overview</h1>
            <p className="text-sm text-text-secondary">Welcome back to JSTR Global ERP panel.</p>
          </div>
        </header>

        {/* ডেমো ড্যাশবোর্ড কন্টেন্ট */}
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
      </main>
    </div>
  );
};

export default Sidebar;
