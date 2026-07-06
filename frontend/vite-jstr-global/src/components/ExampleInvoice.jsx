
import { useState, useEffect } from 'react';
import Select from 'react-select';

const InvoiceProductSearch = () => {
  const [products, setProducts] = useState([]); // ডাটাবেজ থেকে আসা সব প্রোডাক্ট
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDealer, setIsDealer] = useState(false); // ডিলার হলে TP, কাস্টমার হলে MRP
  const [price, setPrice] = useState(0);

  // ১. পেজ লোড হওয়ার সাথে সাথে ডাটাবেজ থেকে প্রোডাক্ট লিস্ট নিয়ে আসা
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Product load করতে সমস্যা হয়েছে:", error);
      }
    };
    loadProducts();
  }, []);

  // ২. react-select dropdown-এর ফরম্যাটে ডাটা সাজানো
  const productOptions = products.map(prod => ({
    value: prod._id, // MongoDB ObjectID
    label: `${prod.productCode} - ${prod.productName}`, // ড্রপডাউনে যা দেখাবে
    tp: prod.tp,
    mrp: prod.mrp
  }));

  // ৩. ড্রপডাউন থেকে প্রোডাক্ট সিলেক্ট করলে যা হবে
  const handleProductChange = (option) => {
    setSelectedProduct(option);
    if (option) {
      // ডিলার হলে TP রেট বসবে, সাধারণ কাস্টমার হলে MRP রেট বসবে
      const currentPrice = isDealer ? option.tp : option.mrp;
      setPrice(currentPrice);
    } else {
      setPrice(0);
    }
  };

  // ৪. ডিলার অথবা কাস্টমার মুড চেঞ্জ করলে প্রাইস অটো আপডেট হওয়া
  useEffect(() => {
    if (selectedProduct) {
      const currentPrice = isDealer ? selectedProduct.tp : selectedProduct.mrp;
      setPrice(currentPrice);
    }
  }, [isDealer, selectedProduct]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-slate-100 shadow-md rounded-2xl my-10 space-y-6">
      
      {/* ডিলার / কাস্টমার টগল */}
      <div className="flex gap-6 p-4 bg-slate-50 rounded-xl">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
          <input type="radio" checked={!isDealer} onChange={() => setIsDealer(false)} className="w-4 h-4 accent-[#4bcbfa]" />
          General Customer (MRP)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
          <input type="radio" checked={isDealer} onChange={() => setIsDealer(true)} className="w-4 h-4 accent-[#4bcbfa]" />
          Wholesale Dealer (TP)
        </label>
      </div>

      {/* লাইভ প্রোডাক্ট সার্চ ড্রপডাউন */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search Product (Code or Name)</label>
        <Select
          options={productOptions}
          isClearable
          placeholder="Type product code or description..."
          onChange={handleProductChange}
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: '12px',
              borderColor: state.isFocused ? '#4bcbfa' : '#e2e8f0',
              boxShadow: state.isFocused ? '0 0 0 4px rgba(75, 203, 250, 0.15)' : 'none',
              '&:hover': { borderColor: '#4bcbfa' }
            })
          }}
        />
      </div>

      {/* অটোমেটিক প্রাইস ডিসপ্লে (রিড-অনলি) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Unit Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">৳</span>
          <input 
            type="number" 
            readOnly 
            value={price} 
            className="w-full pl-8 pr-4 py-3 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed" 
            placeholder="0.00"
          />
        </div>
      </div>

    </div>
  );
};

export default InvoiceProductSearch;
