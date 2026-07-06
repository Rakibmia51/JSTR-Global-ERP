import { useEffect } from 'react';
import  { useState } from 'react';
import Select from 'react-select';

const InvoiceForm = () => {
  // 1. Core State Management
  const [isDealer, setIsDealer] = useState(false);
  const [products, setProducts] = useState([]); // ডাটাবেজ থেকে আসা সব প্রোডাক্ট
  
 

  const [dealerCode, setDealerCode] = useState(''); // Array to store fetched dealers from your API
  const [fetchedDealerName, setFetchedDealerName] = useState('');

  const [nextInvoiceNo, setNextInvoiceNo] = useState('Loading...');


   // NEW: State to store and show the last successfully saved invoice number inside the form
  const [lastSavedInvoiceNo, setLastSavedInvoiceNo] = useState('None');

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

    // ১. পেজ লোড হওয়ার সাথে সাথে ডাটাবেজ থেকে প্রোডাক্ট লিস্ট নিয়ে আসা
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
  

    // ১. প্রোডাক্ট সিলেক্ট করলে ওই নির্দিষ্ট লাইনের আইডি এবং দাম সেট করার জন্য
const handleProductSelect = (index, selectedOption) => {
  const updatedItems = [...formData.items];
  
  if (selectedOption) {
    updatedItems[index].productId = selectedOption.value; // আইডি সেভ হবে
    updatedItems[index].productName = selectedOption.label;
    
    // ডিলার নাকি কাস্টমার তার ওপর ভিত্তি করে দাম বসবে (isDealer স্টেট আপনার মেইন ফাইলে থাকলে)
    updatedItems[index].unitPrice = isDealer ? selectedOption.tp : selectedOption.mrp; 
  } else {
    updatedItems[index].productId = '';
    updatedItems[index].productName = '';
    updatedItems[index].unitPrice = 0;
  }
  
  setFormData({ ...formData, items: updatedItems });
};



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

   
    // Fetch Next Expected Serial Number
  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/invoices/next-number`);
      const result = await response.json();
      if (result.success) {
        setNextInvoiceNo(result.nextInvoiceNo);
      }
    } catch (error) {
      console.error('Error fetching next invoice number:', error);
      setNextInvoiceNo('Error Loading');
    }
  };

  useEffect(() => {
    fetchNextInvoiceNumber();
  }, []);

// নতুন সংযোজন: ফর্ম একদম নতুন করে রিসেট করার ফাংশন (+ New Invoice Button)
  const handleNewInvoiceReset = () => {
    setDealerCode('');
    setFetchedDealerName('');
    setFormData({
      dealer: '',
      customerName: '',
      customerMobile: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      tax: 0,
      paidAmount: 0,
      paymentMethod: 'Cash',
      createdBy: '65f8a123cd456ef789012345'
    });
    fetchNextInvoiceNumber(); // রিসেট করার সময় ডাটাবেজ থেকে লেটেস্ট সিরিয়াল নম্বর আবার চেক করবে
  };

 // NEW: Automatic Real-time Dealer Search using useEffect
  useEffect(() => {
    // If input has less than 3 characters, do not trigger API call
    if (dealerCode.trim().length < 3) {
      setFetchedDealerName('');
      setFormData(prev => ({ ...prev, dealer: '' }));
      return;
    }

    const fetchDealerAutomatically = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/dealers/code/${dealerCode.trim()}`);
        const result = await response.json();

        if (result.success) {
          setFetchedDealerName(result.data.name);
          setFormData(prev => ({ ...prev, dealer: result.data._id })); // Link database _id
        } else {
          // Keep it clean if dealer is not found while typing
          setFetchedDealerName('Searching or Not Found...');
          setFormData(prev => ({ ...prev, dealer: '' }));
        }
      } catch (error) {
        console.error('Auto-fetch network error:', error);
      }
    };

    // Debounce/Timeout setup to optimize API calls while typing
    const delayDebounceFn = setTimeout(() => {
      fetchDealerAutomatically();
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [dealerCode]);


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
    setIsSubmitting(true);
   
    
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
      const response = await fetch(`${SERVER_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Invoice created successfully! Invoice No: ${result.data.invoiceNo}`);

         setLastSavedInvoiceNo(result.data.invoiceNo);
         // Refresh the next expected serial number from database
        fetchNextInvoiceNumber(); 
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

         {/* NEW LAYOUT: Dual Serial Numbers Display Fields inside the Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500">Expected Invoice No (Next)</label>
            <input 
              type="text" 
              readOnly 
              value={nextInvoiceNo} 
              className="mt-1 w-full p-2 border rounded bg-gray-50 font-mono font-bold text-gray-700 tracking-wider text-center" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600">Last Saved Invoice No (Recent)</label>
            <input 
              type="text" 
              readOnly 
              value={lastSavedInvoiceNo} 
              className="mt-1 w-full p-2 border border-emerald-300 rounded bg-emerald-50 font-mono font-bold text-emerald-800 tracking-wider text-center" 
            />
          </div>
        </div>

        {/* Customer Type Selection */}
        <div className="flex gap-4 p-3 bg-gray-50 rounded">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input type="radio" checked={!isDealer} onChange={() => setIsDealer(false)} className="w-4 h-4" />
            General Customer (MRP)
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input type="radio" checked={isDealer} onChange={() => setIsDealer(true)} className="w-4 h-4" />
            Dealer (TP)
          </label>
        </div>

        {/* Dynamic Context Fields WITHOUT Verify Button */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Dealer Code</label>
              <input type="text" value={dealerCode} onChange={(e) => setDealerCode(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm uppercase" placeholder="e.g. DLR-0001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">Verified Dealer Name</label>
              <input type="text" readOnly value={fetchedDealerName} className="mt-1 w-full p-2 border rounded bg-gray-100 text-sm font-medium text-emerald-700 border-emerald-300" placeholder="Type a valid dealer code..." />
            </div>
          </div>
        )}

        {/* Product Items Table */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Product Items</h3>
         {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
            
            {/* ১. প্রোডাক্ট সিলেক্ট ড্রপডাউন */}
            <div className="col-span-5">
              <Select
                options={productOptions}
                isClearable
                placeholder="Product Name" 
                required
                // লুপের নির্দিষ্ট আইটেমটি ড্রপডাউনে সিলেক্টেড দেখানোর জন্য value পাস করতে হবে
                value={productOptions.find(opt => opt.value === item.productId) || null}
                // ইনডেক্স সহ কাস্টম হ্যান্ডলার কল করা হয়েছে
                onChange={(selectedOption) => handleProductSelect(index, selectedOption)} 
                className="w-full text-sm" 
              />
            </div>

            {/* ২. কোয়ান্টিটি ইনপুট */}
            <div className="col-span-2">
              <input 
                type="number" 
                placeholder="Qty" 
                min="1" 
                required 
                value={item.quantity || ''} 
                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>

            {/* ৩. ইউনিট প্রাইস ইনপুট (ডাইনামিক আইটেম ওয়াইজ) */}
            <div className="col-span-2">
              <input 
                type="number" 
                placeholder="Price" 
                min="0" 
                required 
                readOnly 
                value={item.unitPrice || ''} // গ্লোবাল price না দিয়ে নির্দিষ্ট item.unitPrice ব্যবহার করা হয়েছে
                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>

            {/* ৪. টোটাল প্রাইজ ক্যালকুলেশন */}
            <div className="col-span-2 text-right font-medium text-sm text-gray-600">
              ৳{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
            </div>

            {/* ৫. রো ডিলিট বাটন */}
            <div className="col-span-1 text-center">
              <button 
                type="button" 
                onClick={() => removeItemRow(index)} 
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
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


        {/* Action Row: Save Invoice & New Invoice Buttons Side-by-Side */}
        <div className="flex flex-col sm:flex-row gap-4  pt-4">
          {/* Primary Save Action */}
          <button 
            type="submit" 
           
           className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             Save & Save Invoice
          </button>
          
          {/* Brand New Isolated Reset Button Trigger */}
          <button 
            type="button" 
            onClick={handleNewInvoiceReset}
            className="sm:w-1/3 bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition duration-200"
          >
            + New Invoice
          </button>

          {/* ১. ইনভয়েস প্রিন্ট বাটন */}
          <button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
          >
            🖨️ Print Invoice
          </button>
          
          {/* ২. চালান প্রিন্ট বাটন */}
          <button 
            type="button" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
          >
            📦 Print Challan
          </button>
        </div>

      </form>
    </div>
  );
};

export default InvoiceForm;
