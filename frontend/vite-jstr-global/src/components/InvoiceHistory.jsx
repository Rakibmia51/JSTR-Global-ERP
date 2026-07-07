
import { Link } from 'react-router-dom';

const InvoiceHistoryTable = ({ invoices }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm text-left">
        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4">Invoice No</th>
            <th className="px-6 py-4">Client/Dealer</th>
            <th className="px-6 py-4">Grand Total</th>
            <th className="px-6 py-4">Paid Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-slate-200 text-slate-600">
          {invoices && invoices.map((invoice) => (
            <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoiceNo}</td>
              <td className="px-6 py-4">{invoice.dealer || invoice.customerName || 'N/A'}</td>
              <td className="px-6 py-4">৳{invoice.grandTotal}</td>
              <td className="px-6 py-4 text-emerald-600 font-medium">৳{invoice.paidAmount}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  invoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  invoice.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {invoice.paymentStatus}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {/*  সঠিক এডিট বাটন: এখানে invoice._id ব্যবহার করা হয়েছে */}
                <Link 
                  to={`/accounting/update-invoice/${invoice._id}`} 
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-4 rounded-xl shadow-sm text-xs transition-all"
                >
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceHistoryTable;
