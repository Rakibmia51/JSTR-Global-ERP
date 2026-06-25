import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit3, Eye, Trash2 } from 'lucide-react';
import EditEmployeeModal from './EditEmployeeModal';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]); // ফিল্টার করা ডাটা রাখার জন্য
  const [searchTerm, setSearchTerm] = useState('');               // সার্চ টেক্সট
  const [selectedDepartment, setSelectedDepartment] = useState(''); // সিলেক্টেড ডিপার্টমেন্ট
  const [departmentsList, setDepartmentsList] = useState([]);     // ড্রপডাউন ডাইনামিক লিস্টের জন্য
  const navigate = useNavigate();


  // ব্যাকএন্ড থেকে ডাটা ফেচ করা
  const fetchEmployees = async () => {
    const token = localStorage.getItem('token'); 
      try {
        const response = await fetch('http://localhost:3000/api/users/all', {
        headers: {
            'Authorization': `Bearer ${token}` // আপনার অথ মিডলওয়্যার পাস করার জন্য
            }

        }); // আপনার ব্যাকএন্ড ইউআরএল
        const result = await response.json();
       
        if (result.success) {
          setEmployees(result.data);
          setFilteredEmployees(result.data);
          // কর্মচারীদের ডাটা থেকে ইউনিক ডিপার্টমেন্টগুলোর নাম স্বয়ংক্রিয়ভাবে ফিল্টার করে বের করা
          const uniqueDepts = [...new Set(result.data.map(emp => emp.department?.name).filter(Boolean))];
          setDepartmentsList(uniqueDepts);
          console.log('Fetched Employees:', result.data);
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


  useEffect(() => {
    fetchEmployees();
  }, []);

  // সার্চইন বা ডিপার্টমেন্ট ড্রপডাউন চেঞ্জ হলে লাইভ ফিল্টার হবে
// ১. ডাটা লোড হওয়ার পর ইউনিক ডিপার্টমেন্ট লিস্ট তৈরি করা
useEffect(() => {
  if (employees.length > 0) {
    setFilteredEmployees(employees); // শুরুতে সব ডাটাই দেখাবে

    // ডিপার্টমেন্ট অবজেক্ট হলে 'name' নিবে, আর সরাসরি টেক্সট বা আইডি হলে সেটিই নিবে
    const uniqueDepts = [
      ...new Set(employees.map(emp => 
        typeof emp.department === 'object' ? emp.department?.name : emp.department
      ).filter(Boolean))
    ];
    setDepartmentsList(uniqueDepts);
  }
}, [employees]);

// ২. লাইভ ফিল্টারিং লজিক (নিখুঁত ম্যাচিং)
useEffect(() => {
  let tempEmployees = [...employees];

  // সার্চ ফিল্টার
  if (searchTerm.trim() !== '') {
    const currSearch = searchTerm.toLowerCase();
    tempEmployees = tempEmployees.filter((emp) =>
      emp.name?.toLowerCase().includes(currSearch) ||
      emp.idNo?.toLowerCase().includes(currSearch) ||
      emp.mobileNo?.includes(currSearch)
    );
  }

  // ডিপার্টমেন্ট ফিল্টার
  if (selectedDepartment !== '') {
    tempEmployees = tempEmployees.filter((emp) => {
      const deptName = typeof emp.department === 'object' ? emp.department?.name : emp.department;
      return deptName === selectedDepartment;
    });
  }

  setFilteredEmployees(tempEmployees);
}, [searchTerm, selectedDepartment, employees]);

 // এডিট স্টেটের জন্য ভেরিয়েবল
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);


   // ==========================================
  // 🗑️ DELETE FUNCTION
  // ==========================================
  const handleDelete = async (id) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই কর্মচারীর ডাটা ডিলিট করতে চান?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // সফল হলে ফ্রন্টএন্ড স্টেট থেকে ওই এমপ্লয়িকে বাদ দেওয়া (UI আপডেট)
        setEmployees(employees.filter(emp => emp._id !== id));
        alert('সফলভাবে ডিলিট হয়েছে!');
      } catch (err) {
        alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
      }
    }
  };


   // ==========================================
  // 📝 EDIT FUNCTIONS
  // ==========================================
  // এডিট বাটনে ক্লিক করলে ডাটা মডালে বা ফর্মে পাঠানো
  const handleEditClick = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditModal(true);
  };


  if (loading) return <div className="p-6 text-center text-lg font-semibold">Loading Employees...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        
        {/* টেবিল হেডার / শিরোনাম */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-wide">All Employees List ({employees.length})</h2>
          <button 
            onClick={() => navigate('/admin-panel/employees/add')} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
            + Add New Staff
          </button>
        </div>

        {/* 🔍 সার্চ এবং ফিল্টার সেকশন (রেসপন্সিভ গ্রিড) */}
        <div className="p-4 bg-gray-100 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* সার্চ ইনপুট বক্স */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Staff</label>
            <input
              type="text"
              placeholder="Search by Name, ID or Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* ডিপার্টমেন্ট ড্রপডাউন ফিল্টার */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter by Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              {departmentsList.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 📱 রেসপন্সিভ কন্টেইনার (মোবাইল ও ডেক্সটপ হ্যান্ডলার) */}
        <div>
          
          {/* ১. মোবাইল ভিউ: ছোট স্ক্রিনে (xs, sm, md) এই কার্ডগুলো দেখাবে, ডেক্সটপে (lg) হাইড থাকবে */}
          <div className="block lg:hidden divide-y divide-gray-200">
            {filteredEmployees.map((emp) => (
              <div key={emp._id} className="p-4 bg-white hover:bg-gray-50 transition space-y-3">
                
                {/* প্রোফাইল, নাম ও আইডি */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={emp.photo ? `http://localhost:3000/${emp.photo}` : 'https://placehold.co'} 
                    alt={emp.name} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-indigo-600 font-mono">{emp.idNo}</div>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                    emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* কন্টাক্ট, ডিপার্টমেন্ট ও রোল এর গ্রিড */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Contact</span>
                    <div>{emp.mobileNo}</div>
                    <div className="text-gray-400 truncate max-w-[150px]">{emp.email}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Department</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                      {emp.department?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Role</span>
                    <span className="capitalize font-medium">{emp.role}</span>
                  </div>
                </div>

                {/* অ্যাকশন বাটনসমূহ */}
                <div className="flex justify-end space-x-3 pt-2 text-sm">
                  <button 
                    onClick={() => navigate(`/admin-panel/employees/view/${emp._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md">
                   
                   <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
                  </button>
                  {/* ✏️ Lucide Edit3 Icon */}
                        <button 
                        onClick={() => handleEditClick(emp)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
                        >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                        </button>


                   {/* 🗑️ Lucide Trash2 Icon */}
                        <button 
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
                        >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                        </button>
                </div>

              </div>
            ))}
          </div>

          {/* ২. ডেক্সটপ ভিউ: বড় স্ক্রিনে (lg) টেবিল দেখাবে, মোবাইলে হাইড থাকবে */}
          <div className="hidden lg:block overflow-x-auto">
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
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4">
                        {emp.photo ? (
                          <img 
                            src={`http://localhost:3000/${emp.photo}`} 
                            alt={emp.name} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-300"
                          />
                        ) : (
                          /* 🔠 ছবি না থাকলে নামের প্রথম অক্ষর দিয়ে ডাইনামিক গোল গোল আইকন */
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-200 flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase">
                            {emp.name ? emp.name.charAt(0) : 'E'}
                          </div>
                        )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{emp.name}</div>
                      <div className="text-xs text-indigo-600 font-mono mt-0.5">{emp.idNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{emp.mobileNo}</div>
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                        {emp.department?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium">{emp.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md"
                        onClick={() => navigate(`/admin-panel/employees/view/${emp._id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
                      </button>
                      {/* ✏️ Lucide Edit3 Icon */}
                        <button 
                         onClick={() => handleEditClick(emp)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
                        >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                        </button>


                   {/* 🗑️ Lucide Trash2 Icon */}
                        <button 
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
                        >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {/* যদি এডিট পপআপ/মডাল ওপেন হয় */}
            {showEditModal && (
              <EditEmployeeModal
                employee={editingEmployee} 
                onClose={() => setShowEditModal(false)} 
                onUpdateSuccess={fetchEmployees} // আপডেট হলে লিস্ট রিফ্রেশ করবে
                fetchEmployees={fetchEmployees} 
              />
            )}
            
          </div>

        </div>

        {/* যদি কোনো এমপ্লয়ী না থাকে */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-400 font-medium">
            No employees found in the database.
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeList;
