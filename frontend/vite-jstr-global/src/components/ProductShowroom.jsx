import { useState, useEffect } from 'react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
import { ShoppingBag, Search, RefreshCw, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

const ProductShowroom = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventoryProducts = async () => {
    setLoading(true);
    try {
      // 💡 প্রোডাক্ট লিস্টের আলাদা ডেডিকেটেড এন্ডপয়েন্টে হিট করা হচ্ছে
      const response = await API.get('/products/showroom-list');
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load inventory showroom products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryProducts();
  }, []);

  // প্রোডাক্ট কোড বা প্রোডাক্টের নাম দিয়ে রিয়েল-টাইম ফিল্টারিং সার্চ
  const filteredProducts = products.filter(prod => 
    prod.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 🔝 হেডার কন্ট্রোল বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-brand" size={26} />
            Company Product Showroom
          </h2>
          <p className="text-xs text-slate-500 mt-1">📦 কোম্পানির এভেইলেবল সমস্ত প্রোডাক্টের রেটলিস্ট (TP, MRP) এবং লাইভ স্টক স্ট্যাটাস চেক করুন।</p>
        </div>
        
        <button 
          onClick={fetchInventoryProducts}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand shadow-sm transition-colors self-end sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
        </button>
      </div>

      {/* 🔍 সার্চ ও কাউন্টার স্ট্যাটস বার */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search by Product Name or Code (e.g. AP450)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-brand transition-all" 
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>
        
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 flex-shrink-0">
          <Layers size={13}/> Listed Products: {filteredProducts.length}
        </span>
      </div>

      {/* 📊 ৪-কলাম প্রোডাক্ট কার্ড গ্যালারি গ্রিড */}
      {loading ? (
        <div className="text-center p-20 text-slate-400 font-semibold animate-pulse text-xs">
          Loading company price list matrix...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs shadow-sm">
          No matching products found in the active inventory showroom.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const isOutOfStock = Number(prod.stockQuantity || 0) <= 0;

            return (
              <div 
                key={prod._id} 
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* প্রোডাক্ট বেসিক ইনফো */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="bg-slate-100 text-slate-600 font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {prod.productCode}
                    </span>
                    
                    {/* 🎯 আপনার রিকোয়ারমেন্ট অনুযায়ী ডাইনামিক স্টক ইন্ডিকেটর */}
                    {isOutOfStock ? (
                      <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle size={10} /> Out of Stock
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={10} /> {prod.stockQuantity} Pcs Stock
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-slate-800 tracking-tight line-clamp-2 min-h-[40px] group-hover:text-brand transition-colors">
                    {prod.productName}
                  </h4>
                </div>

                {/* ৳ ট্রেড প্রাইস (TP) এবং ম্যাক্স রিটেইল প্রাইস (MRP) মেটা সেকশন */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Trade Price (TP):</span>
                    <span className="text-slate-800 font-bold">৳{Number(prod.tp || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Retail Price (MRP):</span>
                    <span className="text-indigo-600 font-black">৳{Number(prod.mrp || 0).toLocaleString()}</span>
                  </div>

                  {/* প্রফিট মার্জিন ওভারভিউ */}
                  <div className="bg-slate-50/80 p-2 rounded-xl text-[9px] text-slate-400 font-bold text-center mt-2">
                    Dealer Profit Margin: <span className="text-emerald-600 font-black">৳{(Number(prod.mrp || 0) - Number(prod.tp || 0)).toLocaleString()}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ProductShowroom;
