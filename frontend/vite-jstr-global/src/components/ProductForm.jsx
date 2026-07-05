import { Layers } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ProductForm = () => {
  // 1. React Local State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    productCode: '',
    productName: '',
    tp: '',
    mrp: '',
    stockQuantity: ''
  });

  // 2. Fetch Active Products from Backend API Engine
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error loading inventory products registry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run catalog fetch immediately when component boots up
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle controlled input changes smoothly
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: name === 'productName' || name === 'productCode' ? value : value === '' ? '' : Number(value)
    });
  };

  // 3. Form Submit Operation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const result = await response.json();

      if (result.success) {
        alert(`Product saved successfully! SKU: ${result.data.productCode}`);
        
        // Reset local input placeholders safely
        setProductData({
          productCode: '',
          productName: '',
          tp: '',
          mrp: '',
          stockQuantity: ''
        });
        
        // Trigger live refresh on the table without browser page reload
        fetchProducts();
      } else {
        alert(`Error mapping entry: ${result.message}`);
      }
    } catch (error) {
      alert('Network communication fault encountered while adding product registry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interactive Brand Highlights
  const applyFocusStyle = (e) => {
    e.target.style.borderColor = '#4bcbfa';
    e.target.style.boxShadow = '0 0 0 4px rgba(75, 203, 250, 0.15)';
  };

  const removeFocusStyle = (e) => {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '';
  };

  // 2. Real-time Search Filter Logic
  useEffect(() => {
    const results = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">

        {/* 🟦 টপ হেডার কার্ড */}
        <div className="max-w-7xl mb-8 w-full mx-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-indigo-100 stroke-[2.5]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-wide">Products Configurations</h2>
              <p className="text-xs text-indigo-100 mt-0.5">Manage and organize company product inventory</p>
            </div>
          </div>
        </div>

        {/* Upper Grid Layout Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COMPONENT: Premium Product Registration Form */}
          <div className="lg:col-span-4 bg-white border border-slate-100 shadow-[0_12px_40px_rgba(75,203,250,0.04)] rounded-2xl p-6">
            <div className="mb-6 border-l-4 pl-4" style={{ borderColor: '#4bcbfa' }}>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add New Product</h2>
              <p className="text-xs text-slate-500 mt-0.5">Register stock items and assign wholesale or retail rates.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Product Code / SKU</label>
                <input 
                  type="text" 
                  name="productCode" 
                  required 
                  value={productData.productCode} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wide text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all duration-200" 
                  onFocus={applyFocusStyle}
                  onBlur={removeFocusStyle}
                  placeholder="e.g. P-VOLT-100" 
                />
              </div>
              <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Product Description Name</label>
              <input 
                type="text" 
                name="productName" 
                required 
                value={productData.productName} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all duration-200" 
                onFocus={applyFocusStyle}
                onBlur={removeFocusStyle}
                placeholder="Entry product name here..." 
              />
            </div>

            {/* Dual Market Value Structure */}
            <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-4">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-400">Pricing Configurations</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">TP (Dealer Price)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      name="tp" 
                      required 
                      value={productData.tp} 
                      onChange={handleChange} 
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all duration-200" 
                      onFocus={applyFocusStyle}
                      onBlur={removeFocusStyle}
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">MRP (Retail Price)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">৳</span>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      name="mrp" 
                      required 
                      value={productData.mrp} 
                      onChange={handleChange} 
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all duration-200" 
                      onFocus={applyFocusStyle}
                      onBlur={removeFocusStyle}
                      placeholder="0.00" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Initial Stock Quantity</label>
              <input 
                type="number" 
                min="0" 
                name="stockQuantity" 
                required 
                value={productData.stockQuantity} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all duration-200" 
                onFocus={applyFocusStyle}
                onBlur={removeFocusStyle}
                placeholder="0" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: isSubmitting ? '#cbd5e1' : '#4bcbfa',
                boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(75, 203, 250, 0.25)'
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.target.style.backgroundColor = '#3cbbe5'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.target.style.backgroundColor = '#4bcbfa'; }}
            >
              {isSubmitting ? 'Saving Records...' : 'Commit Product Entry'}
            </button>
            </form>
          </div>

          {/* RIGHT COMPONENT: Live Inventory Tracking Data Table */}
          <div className="lg:col-span-8 bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.01)] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Live Inventory Tracking</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time overview of product availability and stock levels</p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                Total Items: {products.length}
              </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">SKU Code</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-right">Trade Price (TP)</th>
                    <th className="px-6 py-4 text-right">Retail Price (MRP)</th>
                    <th className="px-6 py-4 text-center">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 font-medium text-slate-400">
                        Loading catalog indexes...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 font-medium text-slate-400">
                        No matching product entries found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/40 transition-colors duration-150">
                        {/* Product Code */}
                        <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600 tracking-wide">
                          {product.productCode}
                        </td>
                        {/* Product Name */}
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {product.productName}
                        </td>
                        {/* Trade Price */}
                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                          ৳{product.tp.toFixed(2)}
                        </td>
                        {/* Retail Price */}
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                          ৳{product.mrp.toFixed(2)}
                        </td>
                        {/* Dynamic Stock Badges */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            product.stockQuantity > 50 
                              ? 'bg-blue-50 text-blue-700' 
                              : product.stockQuantity > 0 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {product.stockQuantity} units
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProductForm;
