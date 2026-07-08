import React from 'react';

const InvoiceHistoryTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="mt-6 text-center py-6 bg-gray-50 border border-dashed rounded-xl text-gray-400 text-sm">
        🚫 No update logs found for this invoice.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* হেডার সেকশন */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Invoice Activity & Change Logs</h3>
      </div>

      {/* 📱 ১. মোবাইল ভিউ: শুধুমাত্র ছোট স্ক্রিনে (sm:hidden) কার্ড লেআউট আকারে দেখাবে */}
      <div className="block sm:hidden space-y-3.5">
        {[...logs].reverse().map((log, index) => (
          <div key={log._id || index} className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2.5 shadow-2xs">
            {/* প্রথম লাইন: সময় ও অ্যাকশন স্ট্যাটাস */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                {new Date(log.updatedAt).toLocaleString('en-BD', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase
                ${log.action === 'Created' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
              `}>
                {log.action}
              </span>
            </div>
            
            {/* দ্বিতীয় লাইন: ৩টি আর্থিক হিসাব (গ্রিড সিস্টেম) */}
            <div className="grid grid-cols-3 gap-1 text-center py-2 border-t border-b border-gray-200/50 my-1">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</p>
                <p className="text-xs font-bold text-gray-950 mt-0.5">৳{Number(log.grandTotal).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Paid</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">৳{Number(log.paidAmount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Due</p>
                <p className="text-xs font-bold text-rose-600 mt-0.5">৳{Number(log.dueAmount).toLocaleString()}</p>
              </div>
            </div>

            {/* তৃতীয় লাইন: নোট ও অপারেটরের নাম */}
            <div className="flex justify-between items-center text-xs pt-0.5 gap-2">
              <span className="text-gray-500 italic truncate max-w-[65%]" title={log.note}>
                📝 {log.note || 'No note added'}
              </span>
              <span className="text-[10px] bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded-md font-semibold truncate max-w-[35%]">
                👤 {log.updatedBy || 'Admin'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 ২. ট্যাবলেট ও ডেক্সটপ ভিউ: বড় স্ক্রিনে (hidden sm:block) টেবিল দেখাবে */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider border-b border-gray-100">
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Grand Total</th>
              <th className="py-3.5 px-4">Paid</th>
              <th className="py-3.5 px-4">Due</th>
              <th className="py-3.5 px-4">Note / Reason</th>
              <th className="py-3.5 px-4">Operator</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50 text-gray-700 font-medium">
            {[...logs].reverse().map((log, index) => (
              <tr key={log._id || index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-normal">
                  {new Date(log.updatedAt).toLocaleString('en-BD', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${log.action === 'Created' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
                  `}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-950 font-semibold">৳{Number(log.grandTotal).toLocaleString()}</td>
                <td className="py-3.5 px-4 text-emerald-600">৳{Number(log.paidAmount).toLocaleString()}</td>
                <td className="py-3.5 px-4 text-rose-600">৳{Number(log.dueAmount).toLocaleString()}</td>
                <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate font-normal" title={log.note}>
                  {log.note || '--'}
                </td>
                <td className="py-3.5 px-4 text-gray-600 text-xs font-normal">{log.updatedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistoryTable;
