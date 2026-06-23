import  { useEffect, useState } from 'react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ব্যাকএন্ড থেকে ডাটা ফেচ করা
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/all'); // আপনার ব্যাকএন্ড ইউআরএল দিন
        const result = await response.json();
       
        
        if (result.success) {
          setEmployees(result.data);
          console.log('Fetched Employees:', result.data); // কনসোল লগে ডাটা দেখানো
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to load employees data');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div className="p-6 text-center text-lg font-semibold">Loading Employees...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        
        {/* টেবিল হেডার / শিরোনাম */}
        <div className="px-6 py-4 bg-gradient-to-r应用 bg-indigo-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-wide">All Employees List ({employees.length})</h2>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
            + Add New Staff
          </button>
        </div>

        {/* রেসপন্সিভ টেবিল কন্টেইনার */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">ID & Name</th>
                <th className="px-6 py-4">Contact & Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition duration-150">
                  
                  {/* প্রোফাইল ছবি */}
                  <td className="px-6 py-4">
                    <img 
                      src={emp.photo ? `http://localhost:3000/${emp.photo}` : 'https://placeholder.com'} 
                      alt={emp.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                  </td>

                  {/* আইডি এবং নাম */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5">{emp.idNo}</div>
                  </td>

                  {/* মোবাইল এবং ইমেইল */}
                  <td className="px-6 py-4">
                    <div>{emp.mobileNo}</div>
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>

                  {/* ডিপার্টমেন্ট নাম */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                      {emp.department?.name || 'N/A'}
                    </span>
                  </td>

                  {/* ইউজার রোল */}
                  <td className="px-6 py-4 capitalize font-medium">{emp.role}</td>

                  {/* একটিভ নাকি ইন-একটিভ */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* অ্যাকশন বাটন (Edit/View) */}
                  <td className="px-6 py-4 text-center space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
                      View
                    </button>
                    <button className="text-emerald-600 hover:text-emerald-900 font-medium">
                      Edit
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* যদি কোনো এমপ্লয়ী না থাকে */}
        {employees.length === 0 && (
          <div className="text-center py-12 text-gray-400 font-medium">
            No employees found in the database.
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeList;
