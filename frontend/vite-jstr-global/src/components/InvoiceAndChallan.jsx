import React, { useState } from 'react';
import Select from 'react-select';

const InvoiceForm2 = () => {
  const [isSaved, setIsSaved] = useState(false); // ইনভয়েস সেভ হয়েছে কিনা ট্র্যাক করার স্টেট
  const [isChallan, setIsChallan] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000), // অটো জেনারেটেড নম্বর
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]
  });

  // ডাটাবেজে ইনভয়েস সেভ করার ফাংশন
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // আপনার ব্যাকএন্ড এপিআই এখানে কল করুন
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (data.success) {
        alert('Invoice successfully saved to database!');
        setIsSaved(true); // সেভ সফল হলে বাটনগুলো আনলক হবে
      } else {
        alert('Failed to save invoice: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Server error! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ব্রাউজার প্রিন্ট ট্রিগার ফাংশন
  const handlePrint = (mode) => {
    setIsChallan(mode === 'challan');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // নতুন ইনভয়েস তৈরি করার জন্য রিসেট বাটন
  const handleResetForm = () => {
    setFormData({
      invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]
    });
    setIsSaved(false); // পুনরায় বাটন লক করা
  };

  // সাবটোটাল হিসাব
  const subtotal = formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white border border-slate-200 shadow-xl rounded-2xl print-area">
      
      {/* অ্যাকশন বাটন সেকশন (Conditional Rendering) */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-dashed border-slate-200 no-print">
        <h2 className="text-xl font-bold text-slate-800">New Invoice</h2>
        
        <div className="flex gap-3">
          {/* ১. ইনভয়েস সেভ না হলে এই বাটনটি দেখাবে */}
          {!isSaved ? (
            <button 
              type="button" 
              onClick={handleSubmitInvoice}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md text-sm transition-all"
            >
              {loading ? 'Saving to Database...' : '💾 Save Invoice'}
            </button>
          ) : (
            /* ২. ইনভয়েস সেভ হয়ে গেলে প্রিন্ট, চালান এবং নতুন ফর্মের বাটন আসবে */
            <>
              <button 
                type="button" 
                onClick={() => handlePrint('invoice')}
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
              >
                🖨️ Print Invoice
              </button>
              
              <button 
                type="button" 
                onClick={() => handlePrint('challan')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
              >
                📦 Print Challan
              </button>

              <button 
                type="button" 
                onClick={handleResetForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-sm transition-all"
              >
                + Create New
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================== ইনভয়েস/চালান প্রিন্ট ভিউ লেআউট ==================== */}
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Your Company Ltd.</h1>
          <p className="text-sm text-slate-500 mt-1">Dhaka, Bangladesh</p>
        </div>
        <div className="text-right">
          <h2 className={`text-3xl font-extrabold uppercase tracking-wide ${isChallan ? 'text-emerald-600' : 'text-blue-600'}`}>
            {isChallan ? 'Delivery Challan' : 'Invoice'}
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">#{formData.invoiceNo}</p>
        </div>
      </div>

      {/* কাস্টমার ডাটা ইনপুট (সেভ হয়ে গেলে ইনপুট ফিল্ডগুলো রিড-অনলি মোডে চলে যাবে) */}
      <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 no-print-bg">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Customer Name</label>
          <input 
            type="text" 
            disabled={isSaved}
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm disabled:border-transparent disabled:bg-transparent disabled:p-0 disabled:font-semibold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone Number</label>
          <input 
            type="text" 
            disabled={isSaved}
            value={formData.customerPhone}
            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm disabled:border-transparent disabled:bg-transparent disabled:p-0 disabled:font-semibold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Address</label>
          <input 
            type="text" 
            disabled={isSaved}
            value={formData.customerAddress}
            onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm disabled:border-transparent disabled:bg-transparent disabled:p-0 disabled:font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* এখানে আপনার আগের ম্যাপিং করা প্রোডাক্ট টেবিলটি বসবে... */}
      {/* (আগের জবাবে দেওয়া কোড অনুযায়ী `isChallan` কন্ডিশন কাজ করবে) */}

    </div>
  );
};

export default InvoiceForm2;
