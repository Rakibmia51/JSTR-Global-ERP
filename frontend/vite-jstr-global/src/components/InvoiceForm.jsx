import React, { useState } from 'react';

const InvoiceForm = () => {
  // 1. Core State Management
  const [dealers, setDealers] = useState([]); // Array to store fetched dealers from your API
  const [isDealer, setIsDealer] = useState(false);
  
  const [formData, setFormData] = useState({
    dealer: '',
    customerName: '',
    customerMobile: '',
    items: [{ productName: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    tax: 0,
    paidAmount: 0,
    paymentMethod: 'Cash',
    createdBy: '' // Temporary logged-in User MongoDB ObjectId
  });

  // 2. Dynamic Product Row Handling
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === 'productName' ? value : Number(value);
    setFormData({ ...formData, items: updatedItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  // 3. Live Calculations for Instant UI Feedback
  const subTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const grandTotal = (subTotal + Number(formData.tax)) - Number(formData.discount);
  const dueAmount = grandTotal - Number(formData.paidAmount);

  
  // 4. API Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ১. প্রোডাক্টের মোট দাম ফ্রন্টএন্ডেই নাম্বার ফরম্যাটে নিশ্চিত করা
    const parsedItems = formData.items.map(item => ({
      productName: item.productName,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
    }));

    // ২. হিসাব-নিকাশগুলো ফ্রন্টএন্ডেই ক্যালকুলেট করে নেওয়া (নিরাপত্তার জন্য)
    const calculatedSubTotal = parsedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const calculatedGrandTotal = (calculatedSubTotal + Number(formData.tax)) - Number(formData.discount);
    const calculatedDueAmount = calculatedGrandTotal - Number(formData.paidAmount);

    // ৩. ফাইনাল পেলোড তৈরি
    const payload = {
      dealer: isDealer ? (formData.dealer || null) : null,
      customerName: isDealer ? null : formData.customerName,
      customerMobile: isDealer ? null : formData.customerMobile,
      items: parsedItems,
      subTotal: calculatedSubTotal,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      grandTotal: calculatedGrandTotal,
      paidAmount: Number(formData.paidAmount) || 0,
      dueAmount: calculatedDueAmount < 0 ? 0 : calculatedDueAmount,
      paymentMethod: formData.paymentMethod,
      
      // গুরুত্বপূর্ণ সমাধান: এখানে অবশ্যই একটি সঠিক ২৪ ডিজিটের MongoDB ObjectId থাকতে হবে
      createdBy: "65f8a123cd456ef789012345" 
    };

    try {
      const response = await fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Invoice created successfully! Invoice No: ${result.data.invoiceNo}`);
        // এখানে ফর্ম রিসেট লজিক দিতে পারেন
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert('Unable to connect to the server.');
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-3">Create New Invoice</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type Selection */}
        <div className="flex gap-4 p-3 bg-gray-50 rounded">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input type="radio" checked={!isDealer} onChange={() => setIsDealer(false)} className="w-4 h-4" />
            General Customer
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input type="radio" checked={isDealer} onChange={() => setIsDealer(true)} className="w-4 h-4" />
            Dealer
          </label>
        </div>

        {/* Dynamic Identity Inputs */}
        {!isDealer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Customer Name</label>
              <input type="text" required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="mt-1 w-full p-2 border rounded" placeholder="Enter customer name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
              <input type="text" required value={formData.customerMobile} onChange={(e) => setFormData({...formData, customerMobile: e.target.value})} className="mt-1 w-full p-2 border rounded" placeholder="Enter mobile number" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700">Select Dealer</label>
            <select required value={formData.dealer} onChange={(e) => setFormData({...formData, dealer: e.target.value})} className="mt-1 w-full p-2 border rounded">
              <option value="">-- Choose Dealer --</option>
              {/* Dummy data mapping - populate this from your backend array */}
              <option value="65f8a123cd456ef789012aaa">Abir Enterprise</option>
              <option value="65f8a123cd456ef789012bbb">Bhai Bhai Traders</option>
            </select>
          </div>
        )}

        {/* Product Items Table */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Product Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
              <div className="col-span-5">
                <input type="text" placeholder="Product Name" required value={item.productName} onChange={(e) => handleItemChange(index, 'productName', e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <div className="col-span-2">
                <input type="number" placeholder="Qty" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <div className="col-span-2">
                <input type="number" placeholder="Price" min="0" required value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <div className="col-span-2 text-right font-medium text-sm text-gray-600">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
              <div className="col-span-1 text-center">
                <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addItemRow} className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600">+ Add Item</button>
        </div>

        {/* Billing & Settlement Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Payment Information</h4>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Payment Method</label>
              <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="mt-1 w-full p-2 border rounded text-sm">
                <option value="Cash">Cash</option>
                <option value="Bkash">Bkash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Paid Amount (Received Today)</label>
              <input type="number" min="0" value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: e.target.value})} className="mt-1 w-full p-2 border rounded text-sm" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
            <div className="flex justify-between"><span>Sub Total:</span><span className="font-medium">${subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span>Discount (-):</span>
              <input type="number" min="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-24 p-1 border rounded text-right text-sm" />
            </div>
            <div className="flex justify-between items-center">
              <span>Tax/Vat (+):</span>
              <input type="number" min="0" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} className="w-24 p-1 border rounded text-right text-sm" />
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base text-gray-800"><span>Grand Total:</span><span>${grandTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-red-600"><span>Due Amount:</span><span>${dueAmount.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition duration-200">
          Save & Save Invoice
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;
