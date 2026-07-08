import { useEffect } from 'react';
import  { useState } from 'react';
import Select from 'react-select';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceHistoryTable from './InvoiceHistoryTable'; // পাথ ঠিক রাখুন


const InvoiceForm = () => {

  const { id } = useParams(); // URL থেকে আইডি নেওয়ার জন্য (যদি এডিট মোড হয়)
  const navigate = useNavigate();

  // 1. Core State Management
  const [isDealer, setIsDealer] = useState(false);
  const [products, setProducts] = useState([]); // ডাটাবেজ থেকে আসা সব প্রোডাক্ট
  
 // সাবমিট এবং লোডিং স্টেট
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    invoiceNo: '',
    dealer: '',
    customerName: '',
    customerMobile: '',
    items: [],
    discount: 0,
    tax: 0,
    paidAmount: 0,
    paymentMethod: 'Cash',
    createdBy: '' // Temporary logged-in User MongoDB ObjectId
  });

// যদি এডিট মোড হয় (URL-এ id থাকে), তবে ডাটাবেজ থেকে আগের ডাটা লোড করা
useEffect(() => {
  if (id) {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/invoices/${id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const invoiceData = result.data;

          // ১. মূল ফর্ম ডাটা সেট করা
          setFormData({
            invoiceNo: invoiceData.invoiceNo || '',
            dealer: invoiceData.dealer?._id || invoiceData.dealer || '', 
            customerName: invoiceData.customerName || '',
            customerMobile: invoiceData.customerMobile || '',

           // 💡 সমাধান: আইটেম লোড করার সময় productName বা productId দুটিই ব্যাকআপ হিসেবে রাখুন
            items: invoiceData.items ? invoiceData.items.map(item => ({
              productName: item.productName || item.product?.name || '', 
              // যদি আপনার productOptions-এর value-তে প্রোডাক্টের নাম থাকে, তবে এটি কাজ করবে:
              productId: item.productName || item.productId || item.product?._id || item.product ||'', 
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 0,
              totalPrice: Number(item.totalPrice) || 0
            })) : [],

            discount: invoiceData.discount || 0,
            tax: invoiceData.tax || 0,
            grandTotal: invoiceData.grandTotal || 0,
            paidAmount: invoiceData.paidAmount || 0,
            paymentMethod: invoiceData.paymentMethod || 'Cash',
             historyLog: invoiceData.historyLog || []
          });

          // ২. 💡 ডিলারের নাম এবং কোড স্টেটগুলো আলাদা করে সেট করা (সমাধান)
          if (invoiceData.dealer) {
            setIsDealer(true);
            // যদি আপনার ব্যাকএন্ডে ডিলার পপুলেট করা থাকে:
            setDealerCode(invoiceData.dealer.dealerId || ''); 
            setFetchedDealerName(invoiceData.dealer.name || '');
          }

        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
      }
    };
    fetchInvoiceData();
  }
}, [id]);


 // ইনপুট চেঞ্জ হ্যান্ডেলার
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };




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
      invoiceNo: '',
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
    fetchNextInvoiceNumber();
     navigate('/admin-panel/accounting/create-invoice');  // রিসেট করার সময় ডাটাবেজ থেকে লেটেস্ট সিরিয়াল নম্বর আবার চেক করবে
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

  // Printing Functionality: Open a new window with invoice details for printing
  const handleFormPrint = (savedInvoiceData) => {
  const printWindow = window.open('', '_blank');
  
  // ডিলার বা সাধারণ কাস্টমারের নাম, ফোন ও ঠিকানা আলাদা করা
  const clientName = isDealer ? fetchedDealerName : (formData.customerName || 'Walk-in Customer');
  const clientMobile = isDealer ? dealerCode : (formData.customerMobile || 'N/A');
  const clientAddress = isDealer ? "Authorized Dealer" : "Counter Sale";

  // প্রোডাক্ট আইটেম রো জেনারেশন
  const itemRows = formData.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; page-break-inside: avoid;">
      <td style="padding: 10px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
      <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${item.productName}</td>
      <td style="padding: 10px 8px; text-align: center; color: #334155;">${item.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; color: #334155;">৳${Number(item.unitPrice).toLocaleString()}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #0f172a;">৳${Number(item.totalPrice).toLocaleString()}</td>
    </tr>
  `).join('');

  // সাবমিটের পর ডাটাবেজ থেকে পাওয়া আসল ইনভয়েস নম্বর, না থাকলে কারেন্ট নম্বর ব্যবহার করা
  const finalInvoiceNo = savedInvoiceData?.invoiceNo || formData.invoiceNo || 'Draft';

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${finalInvoiceNo}</title>
        <style>
          @import url('https://googleapis.com');
          @media print { body { margin: 0; padding: 10px; } .footer-sig { position: fixed; bottom: 40px; width: 100%; left: 0; } }
          body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 30px; line-height: 1.5; background: #fff; }
          .invoice-card { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; min-height: 90vh; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-placeholder { width: 45px; height: 45px; background: linear-gradient(135deg, #4f46e5, #3b82f6); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
          .company-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
          .company-sub { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; }
          .invoice-meta { text-align: right; }
          .invoice-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; margin: 0 0 8px 0; }
          .meta-text { margin: 3px 0; font-size: 13px; color: #475569; }
          .details-section { display: flex; justify-content: space-between; margin-top: 25px; margin-bottom: 25px; gap: 20px; }
          .details-box { width: 48%; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .details-box h4 { margin: 0 0 8px 0; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .details-box p { margin: 5px 0; font-size: 13px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background-color: #f1f5f9; color: #475569; padding: 12px 8px; font-weight: 600; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 11px; }
          .summary-wrapper { display: flex; justify-content: space-between; margin-top: 20px; gap: 30px; page-break-inside: avoid; }
          .terms-box { width: 55%; font-size: 11px; color: #64748b; line-height: 1.6; }
          .summary-table { width: 40%; font-size: 13px; border-collapse: collapse; }
          .summary-table td { padding: 6px 8px; color: #475569; }
          .total-row { font-weight: 700; font-size: 14px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .footer-sig { display: flex; justify-content: space-between; margin-top: auto; padding-top: 60px; padding-bottom: 20px; }
          .sig-line { width: 180px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #475569; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="logo-area">
              <div class="logo-placeholder">M</div>
              <div>
                <h1 class="company-title">MEGA TRADERS LTD.</h1>
                <p class="company-sub">Motijheel C/A, Dhaka-1000</p>
              </div>
            </div>
            <div class="invoice-meta">
              <h2 class="invoice-title">Invoice</h2>
              <p class="meta-text"><b>Invoice No:</b> ${finalInvoiceNo}</p>
              <p class="meta-text"><b>Date:</b> ${new Date().toLocaleDateString('en-BD', { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <div class="details-section">
            <div class="details-box">
              <h4>Bill To / Customer Information</h4>
              <p><b>Client Name:</b> ${clientName}</p>
              <p><b>Mobile No:</b> ${clientMobile}</p>
              <p><b>Address:</b> ${clientAddress}</p>
            </div>
            <div class="details-box" style="background: #fafafa;">
              <h4>Payment Status & Method</h4>
              <p><b>Payment Method:</b> ${formData.paymentMethod}</p>
              <p><b>Grand Total:</b> ৳${Number(formData.grandTotal).toLocaleString()}</p>
              <p><b>Paid Amount:</b> ৳${Number(formData.paidAmount).toLocaleString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 6%; text-align: center;">SL</th>
                <th style="text-align: left;">Product Description</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 18%; text-align: right;">Unit Price</th>
                <th style="width: 20%; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="summary-wrapper">
            <div class="terms-box">
              <h5>Terms & Conditions:</h5>
              <ul style="margin: 0; padding-left: 15px;">
                <li>Goods once sold will not be taken back.</li>
                <li>This is a computer-generated invoice.</li>
              </ul>
            </div>
            
            <table class="summary-table">
              <tr><td>Sub Total:</td><td style="text-align: right;">৳${Number(formData.subTotal || 0).toLocaleString()}</td></tr>
              <tr><td>Discount:</td><td style="text-align: right; color: #dc2626;">- ৳${Number(formData.discount || 0).toLocaleString()}</td></tr>
              <tr class="total-row"><td>Grand Total:</td><td style="text-align: right;">৳${Number(formData.grandTotal).toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="footer-sig">
            <div class="sig-line">Customer's Signature</div>
            <div class="sig-line">Authorized Signature</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  };

  // 💡 চালান প্রিন্ট করার জন্য আলাদা ফাংশন (Rate/Price কলাম বাদ দিয়ে)
  const handleFormPrintChallan = (savedInvoiceData) => {
  const printWindow = window.open('', '_blank');
  
  // ডিলার বা সাধারণ কাস্টমারের নাম, ফোন ও ঠিকানা আলাদা করা
  const clientName = isDealer ? fetchedDealerName : (formData.customerName || 'Walk-in Customer');
  const clientMobile = isDealer ? dealerCode : (formData.customerMobile || 'N/A');
  const clientAddress = isDealer ? "Authorized Dealer" : "Counter Sale";

  // প্রোডাক্ট আইটেম রো জেনারেশন (💡 এখানে রেট বা প্রাইসের কোনো কলাম থাকবে না)
  const itemRows = formData.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; page-break-inside: avoid;">
      <td style="padding: 12px 8px; text-align: center; color: #64748b; font-size: 14px;">${idx + 1}</td>
      <td style="padding: 12px 8px; font-weight: 600; color: #1e293b; font-size: 14px;">${item.productName}</td>
      <td style="padding: 12px 8px; text-align: center; font-weight: 700; color: #0f172a; font-size: 15px;">${item.quantity} Pcs</td>
    </tr>
  `).join('');

  // ইনভয়েস নম্বর নির্ধারণ
  const finalInvoiceNo = savedInvoiceData?.invoiceNo || formData.invoiceNo || 'Draft';

  printWindow.document.write(`
    <html>
      <head>
        <title>Challan - ${finalInvoiceNo}</title>
        <style>
          @import url('https://googleapis.com');
          @media print { 
            body { margin: 0; padding: 10px; } 
            .footer-sig { position: fixed; bottom: 40px; width: 100%; left: 0; } 
          }
          body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 30px; line-height: 1.5; background: #fff; }
          .invoice-card { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; min-height: 90vh; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-placeholder { width: 45px; height: 45px; background: linear-gradient(135deg, #0284c7, #0ea5e9); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
          .company-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
          .company-sub { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; }
          .invoice-meta { text-align: right; }
          /* 💡 চালানের জন্য আকাশী/নীল থিম এবং ডেলিভারি চালান টাইটেল */
          .invoice-title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0284c7; margin: 0 0 8px 0; }
          .meta-text { margin: 3px 0; font-size: 13px; color: #475569; }
          .details-section { display: flex; justify-content: space-between; margin-top: 25px; margin-bottom: 25px; gap: 20px; }
          .details-box { width: 100%; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .details-box h4 { margin: 0 0 8px 0; color: #0284c7; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .details-box p { margin: 5px 0; font-size: 13px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #f1f5f9; color: #475569; padding: 12px 8px; font-weight: 600; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 12px; }
          .notes-wrapper { margin-top: 30px; font-size: 12px; color: #64748b; line-height: 1.6; page-break-inside: avoid; }
          .footer-sig { display: flex; justify-content: space-between; margin-top: auto; padding-top: 60px; padding-bottom: 20px; }
          .sig-line { width: 180px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #475569; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- হেডার সেকশন -->
          <div class="header">
            <div class="logo-area">
              <div class="logo-placeholder">M</div>
              <div>
                <h1 class="company-title">MEGA TRADERS LTD.</h1>
                <p class="company-sub">Motijheel C/A, Dhaka-1000 | Phone: +880 2-9555555</p>
              </div>
            </div>
            <div class="invoice-meta">
              <h2 class="invoice-title">Delivery Challan</h2>
              <p class="meta-text"><b>Challan / Inv No:</b> ${finalInvoiceNo}</p>
              <p class="meta-text"><b>Delivery Date:</b> ${new Date().toLocaleDateString('en-BD', { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <!-- ডেলিভারি ইনফো -->
          <div class="details-section">
            <div class="details-box">
              <h4>Delivery Location & Consignee</h4>
              <p><b>Customer Name:</b> ${clientName}</p>
              <p><b>Contact Number:</b> ${clientMobile}</p>
              <p><b>Shipping Address:</b> ${clientAddress}</p>
            </div>
          </div>

          <!-- প্রোডাক্ট মেটেরিয়াল লিস্ট টেবিল -->
          <table>
            <thead>
              <tr>
                <th style="width: 10%; text-align: center;">SL</th>
                <th style="text-align: left;">Product Description / Item Name</th>
                <th style="width: 25%; text-align: center;">Quantity (Qty)</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <!-- চালান নোট -->
          <div class="notes-wrapper">
            <h5 style="margin: 0 0 6px 0; color: #334155; font-size: 13px; font-weight: 600;">Declaration & Notes:</h5>
            <ul style="margin: 0; padding-left: 15px;">
              <li>Please verify the quantity and condition of goods at the time of delivery.</li>
              <li>No claims will be accepted after the delivery challan has been signed and received.</li>
              <li>Received the above-mentioned materials in good condition.</li>
            </ul>
          </div>

          <!-- চালান স্বাক্ষর এরিয়া -->
          <div class="footer-sig">
            <div class="sig-line">Receiver's Signature</div>
            <div class="sig-line">Gate Keeper / Loader</div>
            <div class="sig-line">Authorized Authority</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  };




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

    // 💡 ৩. মোড সিলেক্ট করা: URL-এ id থাকুক অথবা formData-তে _id থাকুক, ২ ক্ষেত্রেই এটি এডিট/আপডেট মোড
  const isEditMode = !!id || !!formData._id;
  const finalId = id || formData._id; // আপডেটের জন্য নির্দিষ্ট আইডি

    // ৩. ফাইনাল পেলোড তৈরি
   const payload = {
    // 💡 এডিট মোড হলে ইনভয়েস নম্বরটিও পেলোডে পাঠানো ভালো যেন ব্যাকএন্ডে চেঞ্জ না হয়
    ...(isEditMode && { invoiceNo: formData.invoiceNo }),

    // 💡 সমাধান: যদি ডিলার সিলেক্ট করা থাকে এবং আইডির মান থাকে তবেই আইডি যাবে, অন্যথায় strictly null যাবে
    dealer: isDealer && formData.dealer ? formData.dealer : null, 
    
    customerName: isDealer ? null : (formData.customerName || null),
    customerMobile: isDealer ? null : (formData.customerMobile || null),
    items: parsedItems,
    subTotal: calculatedSubTotal,
    discount: Number(formData.discount) || 0,
    tax: Number(formData.tax) || 0,
    grandTotal: calculatedGrandTotal,
    paidAmount: Number(formData.paidAmount) || 0,
    dueAmount: calculatedDueAmount < 0 ? 0 : calculatedDueAmount,
    paymentMethod: formData.paymentMethod,
    createdBy: "65f8a123cd456ef789012345" 
  };

    try {

      // 💡 ডাইনামিক ইউআরএল এবং মেথড সিলেকশন (id থাকলে Update, না থাকলে Create)
    // নিশ্চিত করুন আপনার কম্পোনেন্টের উপরে `const { id } = useParams();` নেওয়া আছে
    const url = isEditMode 
      ? `${SERVER_URL}/api/invoices/${finalId}` 
      : `${SERVER_URL}/api/invoices`;
    
    const method = isEditMode ? 'PUT' : 'POST';


      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 💡 সফল হলে এডিট নাকি ক্রিয়েট সে অনুযায়ী মেসেজ দেখানো
        if (isEditMode) {
        alert('Invoice updated successfully!');
        } else {
        alert(`Invoice created successfully! Invoice No: ${result.data.invoiceNo}`);
        setLastSavedInvoiceNo(result.data.invoiceNo);
         // Refresh the next expected serial number from database
        fetchNextInvoiceNumber(); 
        // এখানে ফর্ম রিসেট লজিক দিতে পারেন


         // 💡 নতুন ইনভয়েস তৈরি সফল হলে ব্যাকএন্ড থেকে জেনারেট হওয়া ইনভয়েস নম্বরসহ প্রিন্ট হবে
         // handleFormPrint(result.data); 
        }
         
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert('Unable to connect to the server.');
    }finally{
      setIsSubmitting(false)
    }
  };


  //---- 08-07-2026

// ১ নম্বর ফাংশন: URL ID দিয়ে ডাটা আনার জন্য
const fetchInvoiceById = async (invoiceId) => {
  setIsLoading(true);
  try {
    const response = await fetch(`${SERVER_URL}/api/invoices/${invoiceId}`);
    const result = await response.json();
    if (result.success && result.data) {
      fillFormData(result.data); // ফর্ম ডাটা ফিল করার কমন ফাংশন
    }
  } catch (error) {
    console.error("Error fetching by ID:", error);
  } finally {
    setIsLoading(false);
  }
};

// ২ নম্বর ফাংশন: Invoice No ইনপুট দিলে ডাটা আনার জন্য
const fetchInvoiceByNumber = async (invoiceNum) => {
  if (!invoiceNum || id) return; // 💡 URL-এ আইডি থাকলে এই ফাংশনটি রান করার দরকার নেই
  
  setIsLoading(true);
  try {
    const response = await fetch(`${SERVER_URL}/api/invoices/invoice-no/${invoiceNum.trim()}`);
    const result = await response.json();

    if (result.success && result.data) {
      fillFormData(result.data); // ফর্ম ডাটা ফিল করার কমন ফাংশন
      alert("Invoice data loaded from Invoice Number!");
    }
  } catch (error) {
    console.error("Error fetching by Invoice No:", error);
  } finally {
    setIsLoading(false);
  }
};

// কমন ফাংশন: ব্যাকএন্ডের ডাটা ফর্মে সেট করার জন্য
const fillFormData = (invoiceData) => {
  setFormData({
    _id: invoiceData._id, // 💡 আপডেটের জন্য এটি মাস্ট লাগবে
    invoiceNo: invoiceData.invoiceNo || '',
    dealer: invoiceData.dealer?._id || invoiceData.dealer || '', 
    customerName: invoiceData.customerName || '',
    customerMobile: invoiceData.customerMobile || '',
    items: invoiceData.items ? invoiceData.items.map(item => ({
      productId: item.product?._id || item.productId || item.product || '', 
      productName: item.productName || item.product?.name || '', 
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || 0
    })) : [],
    discount: invoiceData.discount || 0,
    tax: invoiceData.tax || 0,
    grandTotal: invoiceData.grandTotal || 0,
    paidAmount: invoiceData.paidAmount || 0,
    paymentMethod: invoiceData.paymentMethod || 'Cash',
     // 💡 হিস্ট্রি টেবিলের জন্য এটিও যোগ করুন
    historyLog: invoiceData.historyLog || [] 
  });

  if (invoiceData.dealer) {
    setIsDealer(true);
    setDealerCode(invoiceData.dealer.dealerId || ''); 
    setFetchedDealerName(invoiceData.dealer.name || '');
  } else {
    setIsDealer(false);
  }
};

  useEffect(() => {
  if (id) {
    // 💡 URL-এ id থাকলে সেই আইডি দিয়ে ডাটা নিয়ে আসবে
    fetchInvoiceById(id); 
  }
}, [id]);


  if (isLoading) {
    return <div>Loading invoice data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-3">{id ? 'Update Invoice' : 'Create New Invoice'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* উদাহরণ ইনপুট ফিল্ড */}
       <div className="relative mb-6 max-w-md">
          {/* লেবেল ডিজাইন */}
          <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Invoice Searching / No:
          </label>

          {/* ইনপুট কন্টেইনার */}
          <div className="relative rounded-xl shadow-sm">
            {/* বাম পাশের সার্চ আইকন */}
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* মূল ইনপুট ফিল্ড */}
            <input 
              type="text" 
              name="invoiceNo" 
              value={formData.invoiceNo || ''} 
              onChange={handleChange} 
              disabled={!!id} 
              onBlur={(e) => !id && fetchInvoiceByNumber(e.target.value)} 
              placeholder="Type Invoice No & press tab/click outside"
              className={`block w-full pl-11 pr-12 py-3 border rounded-xl text-red-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-sm font-medium
                ${!!id 
                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed shadow-none' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
            />

            {/* ডান পাশের লোডিং স্পিনার (শুধুমাত্র ডাটা ফেচ হওয়ার সময় দেখাবে) */}
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* হেল্পার টেক্সট (ইউজারকে গাইড করার জন্য) */}
          {!id && (
            <p className="mt-1.5 text-xs text-gray-500 pl-1">
              💡 Tip: Type and click outside to auto-load old invoice data.
            </p>
          )}
       </div>


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
                value={
                    productOptions.find(opt => opt.value === item.productId || opt.label === item.productName) || null
                    //productOptions.find(opt => opt.value === item.productId || opt.label === item.productName) || null
                  
                  }
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
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Saving Changes...'
            ) : (id || formData?._id) ? (
              // 💡 URL-এ id থাকুক বা formData-তে _id থাকুক, ২ ক্ষেত্রেই 'Update' দেখাবে
              'Update Invoice' 
            ) : (
              'Create Invoice'
            )}
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
           onClick={() => handleFormPrint()}
          >
            🖨️ Print Invoice
          </button>
          
          {/* ২. চালান প্রিন্ট বাটন */}
          <button 
            type="button" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md flex items-center gap-2 text-sm transition-all"
            onClick={() => handleFormPrintChallan()}
          >
            📦 Print Challan
          </button>


        </div>

        {/* ফর্মের নিচে হিস্ট্রি লগের টেবিল দেখাবে */}
      <InvoiceHistoryTable logs={formData.historyLog} />


      </form>
    </div>
  );
};

export default InvoiceForm;
