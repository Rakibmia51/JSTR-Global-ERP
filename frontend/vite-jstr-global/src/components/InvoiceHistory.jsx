import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const SERVER_URL = "http://localhost:3000"; // আপনার সার্ভার ইউআরএল

  // ব্যাকএন্ড থেকে ডাটা লোড করা
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/invoices`);
        const result = await response.json();
        if (result.success) {
          setInvoices(result.data);
          setFilteredInvoices(result.data);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // সার্চ এবং স্ট্যাটাস ফিল্টারিং লজিক
  useEffect(() => {
    let result = invoices;

    // ১. সার্চ ফিল্টার (Invoice No, Customer/Dealer Name দিয়ে খোঁজা)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(inv => 
        inv.invoiceNo?.toLowerCase().includes(term) ||
        inv.customerName?.toLowerCase().includes(term) ||
        inv.dealer?.name?.toLowerCase().includes(term)
      );
    }

    // ২. পেমেন্ট স্ট্যাটাস ফিল্টার
    if (statusFilter !== 'All') {
      result = result.filter(inv => inv.paymentStatus === statusFilter);
    }

    setFilteredInvoices(result);
  }, [searchTerm, statusFilter, invoices]);

  // প্রিন্ট ফাংশন: একটি নতুন উইন্ডো খুলবে এবং ইনভয়েসের HTML তৈরি করবে
const handlePrintInvoice = (inv) => {
  const printWindow = window.open('', '_blank');
  // console.log(inv)
  
  const clientName = inv.dealer ? inv.dealer.name : (inv.customerName || 'Walk-in Customer');
  const clientMobile = inv.dealer ? (inv.dealer.mobilePhoneNo || 'N/A') : (inv.customerMobile || 'N/A');
  const clientAddress = inv.dealer ? (inv.dealer.address || 'N/A') : 'Counter Sale';

  const itemRows = inv.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; page-break-inside: avoid;">
      <td style="padding: 10px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
      <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${item.productName}</td>
      <td style="padding: 10px 8px; text-align: center; color: #334155;">${item.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; color: #334155;">৳${Number(item.unitPrice).toLocaleString()}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #0f172a;">৳${Number(item.totalPrice).toLocaleString()}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${inv.invoiceNo}</title>
        <style>
          @import url('https://googleapis.com');
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
            /* 💡 সমাধান: এখানে ফিক্সড পজিশন পুরোপুরি রিমুভ করা হয়েছে এবং পেজ ব্রেক হ্যান্ডেল করা হয়েছে */
            .footer-sig { page-break-inside: avoid; }
          }
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
          .meta-text b { color: #0f172a; }
          .details-section { display: flex; justify-content: space-between; margin-top: 25px; margin-bottom: 25px; gap: 20px; }
          .details-box { width: 48%; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .details-box h4 { margin: 0 0 8px 0; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .details-box p { margin: 5px 0; font-size: 13px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background-color: #f1f5f9; color: #475569; padding: 12px 8px; font-weight: 600; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .summary-wrapper { display: flex; justify-content: space-between; margin-top: 20px; gap: 30px; page-break-inside: avoid; }
          .terms-box { width: 55%; font-size: 11px; color: #64748b; line-height: 1.6; }
          .terms-box h5 { margin: 0 0 6px 0; color: #334155; font-size: 12px; font-weight: 600; }
          .terms-list { margin: 0; padding-left: 15px; }
          .summary-table { width: 40%; font-size: 13px; border-collapse: collapse; }
          .summary-table td { padding: 6px 8px; color: #475569; }
          .total-row { font-weight: 700; font-size: 14px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .total-row td { color: #0f172a !important; padding: 8px; }
          
          /* 💡 সিগনেচার এরিয়া সিএসএস আপডেট (মার্জিন ব্যবহার করে নিচে নামানো হয়েছে, ফিক্সড পজিশন বাতিল) */
          .footer-sig { display: flex; justify-content: space-between; margin-top: auto; padding-top: 60px; padding-bottom: 20px; }
          .sig-line { width: 140px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #475569; padding-top: 8px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- কোম্পানি ও ইনভয়েস হেডার -->
          <div class="header">
            <div class="logo-area">
              <div class="logo-placeholder">M</div>
              <div>
                <h1 class="company-title">JSTR Global LTD.</h1>
                <p class="company-sub">Motijheel C/A, Dhaka-1000 | Phone: +880 2-9555555<br>Email: info@jstrglobal.com | Web: ://jstrglobal.com</p>
              </div>
            </div>
            <div class="invoice-meta">
              <h2 class="invoice-title">Invoice</h2>
              <p class="meta-text"><b>Invoice No:</b> ${inv.invoiceNo}</p>
              <p class="meta-text"><b>Date:</b> ${new Date(inv.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <!-- কাস্টমার এবং পেমেন্ট ডিটেইলস -->
          <div class="details-section">
            <div class="details-box">
              <h4>Bill To / Customer Information</h4>
              <p><b>Client Name:</b> ${clientName}</p>
              <p><b>Mobile No:</b> ${clientMobile}</p>
              <p><b>Address:</b> ${clientAddress}</p>
              ${inv.dealer ? `<p style="margin-top: 8px;"><span style="background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">Authorized Dealer</span></p>` : `<p style="margin-top: 8px;"><span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">Retail Customer</span></p>`}
            </div>
            <div class="details-box" style="background: #fafafa;">
              <h4>Payment Status & Method</h4>
              <p><b>Payment Method:</b> ${inv.paymentMethod}</p>
              <p><b>Payment Status:</b> <span style="font-weight: 700; color: ${inv.paymentStatus === 'Paid' ? '#16a34a' : inv.paymentStatus === 'Due' ? '#dc2626' : '#d97706'}">${inv.paymentStatus}</span></p>
              <p><b>Prepared By:</b> System Operator</p>
            </div>
          </div>

          <!-- প্রোডাক্ট টেবিল -->
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

          <!-- হিসাব-নিকাশ এবং শর্তাবলী সেকশন -->
          <div class="summary-wrapper">
            <div class="terms-box">
              <h5>Terms & Conditions:</h5>
              <ul class="terms-list">
                <li>Goods once sold will not be taken back or exchanged.</li>
                <li>Please check the products and cash before leaving the counter.</li>
                <li>Any discrepancies must be reported within 24 hours of delivery.</li>
                <li>This is a computer-generated invoice, no signature is required.</li>
              </ul>
            </div>
            
            <table class="summary-table">
              <tr>
                <td>Sub Total:</td>
                <td style="text-align: right; font-weight: 500;">৳${Number(inv.subTotal || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td style="text-align: right; color: #dc2626;">- ৳${Number(inv.discount || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Tax / Vat:</td>
                <td style="text-align: right; color: #16a34a;">+ ৳${Number(inv.tax || 0).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Grand Total:</td>
                <td style="text-align: right;">৳${Number(inv.grandTotal).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #16a34a; font-weight: 600;">Paid Amount:</td>
                <td style="text-align: right; color: #16a34a; font-weight: 600;">৳${Number(inv.paidAmount).toLocaleString()}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="color: #dc2626; font-weight: 600;">Due Amount:</td>
                <td style="text-align: right; color: #dc2626; font-weight: 600;">৳${Number(inv.dueAmount).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <!-- স্বাক্ষর সেকশন (এখন এটি সবসময় কন্টেন্টের নিচে থাকবে এবং একাধিক পেজ হলে ব্রেক হ্যান্ডেল করবে) -->
          <div class="footer-sig">
            <div class="sig-line">Customer's</div>
            <div class="sig-line">Created By</div>
            <div class="sig-line">Authorized By</div>
            <div class="sig-line">Delivered By</div>
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
  const handleFormPrintChallan = (inv) => {
  const printWindow = window.open('', '_blank');
  
  // ডিলার বা সাধারণ কাস্টমারের নাম, ফোন ও ঠিকানা আলাদা করা
  const clientName = inv.dealer ? inv.dealer.name : (inv.customerName || 'Walk-in Customer');
  const clientMobile = inv.dealer ? (inv.dealer.mobilePhoneNo || 'N/A') : (inv.customerMobile || 'N/A');
  const clientAddress = inv.dealer ? (inv.dealer.address || 'N/A') : 'Counter Sale';
  
  // প্রোডাক্ট আইটেম রো জেনারেশন (💡 এখানে রেট বা প্রাইসের কোনো কলাম থাকবে না)
  const itemRows = inv.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; page-break-inside: avoid;">
      <td style="padding: 12px 8px; text-align: center; color: #64748b; font-size: 14px;">${idx + 1}</td>
      <td style="padding: 12px 8px; font-weight: 600; color: #1e293b; font-size: 14px;">${item.productName}</td>
      <td style="padding: 12px 8px; text-align: center; font-weight: 700; color: #0f172a; font-size: 15px;">${item.quantity} Pcs</td>
    </tr>
  `).join('');

  // ইনভয়েস নম্বর নির্ধারণ
  const finalInvoiceNo = inv.invoiceNo || 'Draft';

  printWindow.document.write(`
    <html>
      <head>
        <title>Challan - ${finalInvoiceNo}</title>
        <style>
          @import url('https://googleapis.com');
          @media print { 
            body { margin: 0; padding: 10px; } 
            .footer-sig { page-break-inside: avoid } 
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
          .sig-line { width: 140px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 12px; color: #475569; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- হেডার সেকশন -->
          <div class="header">
            <div class="logo-area">
              <div class="logo-placeholder">M</div>
               <div>
                  <h1 class="company-title">JSTR Global LTD.</h1>
                  <p class="company-sub">Motijheel C/A, Dhaka-1000 | Phone: +880 2-9555555<br>Email: info@jstrglobal.com | Web: ://jstrglobal.com</p>
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




  if (loading) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading Invoices...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, search, and manage all sales invoices.</p>
        </div>
        <button 
          onClick={() => navigate('/admin-panel/accounting/create-invoice')} // আপনার ফর্মের রাউট পাথ
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Create New Invoice
        </button>
      </div>

      {/* সার্চ এবং ফিল্টার বার */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
        <div className="relative sm:col-span-2">
          <input 
            type="text"
            placeholder="Search by Invoice No, Dealer, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Due">Due</option>
          </select>
        </div>
      </div>

      {/* 📱 মোবাইল ভিউ: কার্ড আকারে দেখাবে (sm:hidden) */}
      <div className="block sm:hidden space-y-4">
        {filteredInvoices.map((inv) => (
          <div key={inv._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">{inv.invoiceNo}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${inv.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                ${inv.paymentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                ${inv.paymentStatus === 'Due' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
              `}>
                {inv.paymentStatus}
              </span>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-semibold text-gray-400">Client:</span> {inv.dealer ? inv.dealer.name : inv.customerName || 'Walk-in Customer'}</p>
              <p><span className="font-semibold text-gray-400">Date:</span> {new Date(inv.createdAt).toLocaleDateString('en-BD')}</p>
              <p><span className="font-semibold text-gray-400">Grand Total:</span> <span className="font-bold text-gray-900">৳{inv.grandTotal.toLocaleString()}</span></p>
              <p><span className="font-semibold text-gray-400">Due Amount:</span> <span className="font-bold text-rose-600">৳{inv.dueAmount.toLocaleString()}</span></p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button 
                onClick={() => navigate(`/admin-panel/accounting/update-invoice/${inv._id}`)} // এডিট পেজে নিয়ে যাবে
                className="flex-1 py-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 rounded-lg text-xs font-bold transition"
              >
                ✏️ Edit
              </button>

            {/* 💡 নতুন প্রিন্ট বাটন */}
              <button 
                onClick={() => handlePrintInvoice(inv)}
                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                title="Print Invoice"
              >
                🖨️ Print
              </button>

              <button 
                onClick={() => handleFormPrintChallan(inv)}
                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                title="Print Challan"
              >
                🖨️ Challan
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* 💻 ডেক্সটপ ভিউ: টেবিল আকারে দেখাবে (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
              <th className="py-4 px-5">Invoice No</th>
              <th className="py-4 px-5">Client / Buyer</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Grand Total</th>
              <th className="py-4 px-5">Paid</th>
              <th className="py-4 px-5">Due</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50 text-gray-700 font-medium">
            {filteredInvoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-5 text-indigo-600 font-bold">{inv.invoiceNo}</td>
                <td className="py-4 px-5">
                  <div className="text-gray-900 font-semibold">
                    {inv.dealer ? inv.dealer.name : inv.customerName || 'Walk-in Customer'}
                  </div>
                  <div className="text-3xs text-gray-400 font-normal">
                    {inv.dealer ? `Dealer ID: ${inv.dealer.dealerId}` : inv.customerMobile || 'No Mobile'}
                  </div>
                </td>
                <td className="py-4 px-5 text-gray-500 font-normal">
                  {new Date(inv.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                </td>
                <td className="py-4 px-5 text-gray-950 font-bold">৳{inv.grandTotal.toLocaleString()}</td>
                <td className="py-4 px-5 text-emerald-600">৳{inv.paidAmount.toLocaleString()}</td>
                <td className="py-4 px-5 text-rose-600">৳{inv.dueAmount.toLocaleString()}</td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                    ${inv.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${inv.paymentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    ${inv.paymentStatus === 'Due' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  `}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td className="py-4 px-5 text-center">
                  <button 
                    onClick={() => navigate(`/admin-panel/accounting/update-invoice/${inv._id}`)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                    title="Edit Invoice"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit
                  </button>

                  {/* 💡 নতুন প্রিন্ট বাটন */}
                  <button 
                    onClick={() => handlePrintInvoice(inv)}
                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                    title="Print Invoice"
                  >
                    🖨️ Print
                  </button>

                  <button 
                    onClick={() => handleFormPrintChallan(inv)}
                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                    title="Print Challan"
                  >
                    🖨️ Challan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ডাটা না থাকলে ফাকা স্টেট */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🚫</span>
          <span>No invoices match your search/filter criteria.</span>
        </div>
      )}
    </div>

    
  );
}

export default InvoiceList;