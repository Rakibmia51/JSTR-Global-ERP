import { useState, useEffect } from 'react';
import { Briefcase, Key, PlusCircle, Trash2, Layers, Save, RefreshCw, Edit3 } from 'lucide-react';

const DepartmentPanel = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ফর্ম ইনপুটের জন্য স্টেট
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  // ১. ব্যাকএন্ড থেকে সমস্ত ডিপার্টমেন্ট লোড করা
  const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      
      const response = await fetch(`${SERVER_URL}/api/departments`,{
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setDepartments(result.data);
        console.log(result.data)
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load departments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ইনপুট হ্যান্ডলার
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ২. নতুন ডিপার্টমেন্ট সাবমিট করা
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');
  setSuccessMsg('');

  // এডিট মোড অন থাকলে এডিটের ইউআরএল ও মেথড সেট হবে, না হলে ক্রিয়েটেরটা হবে
  const url = isEditing 
    ? `${SERVER_URL}/api/departments/${editId}` 
    : `${SERVER_URL}/api/departments`;
  
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const result = await response.json();

    if (response.ok && result.success) {
      setSuccessMsg(isEditing ? '🎉 Department updated successfully!' : '🎉 Department created successfully!');
      setFormData({ name: '', code: '' }); // ফর্ম খালি করা
      setIsEditing(false);
      setEditId(null);
      fetchDepartments(); // লিস্ট রিফ্রেশ করা
    } else {
      setError(result.message || 'Operation failed.');
    }
  } catch (err) {
    setError('❌ Connection error. Failed to reach server.');
  } finally {
    setSubmitting(false);
  }
};


const [isEditing, setIsEditing] = useState(false); // এডিট মোড অন/অফ ট্র্যাক করবে
const [editId, setEditId] = useState(null);       // কোন আইডি এডিট হচ্ছে তা রাখবে

const handleEditClick = (dept) => {
  setIsEditing(true);
  setEditId(dept._id);
  setFormData({ name: dept.name, code: dept.code }); // ফর্ম ইনপুটে ডেটা বসিয়ে দেওয়া
};


const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this department?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SERVER_URL}/api/departments/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (response.ok && result.success) {
      setSuccessMsg('🗑️ Department deleted successfully!');
      fetchDepartments(); // লিস্ট রিফ্রেশ করা
    } else {
      setError(result.message || 'Failed to delete department.');
    }
  } catch (err) {
    setError('❌ Network error. Failed to delete.');
  }
};



  return (
    //className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6"
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
      
      {/* 🟦 টপ হেডার কার্ড */}
      <div className="max-w-7xl w-full mx-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-indigo-100 stroke-[2.5]" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide">Department Configurations</h2>
            <p className="text-xs text-indigo-100 mt-0.5">Manage and organize company corporate sector divisions</p>
          </div>
        </div>
      </div>

      {/* 🧾 মেইন গ্রিড লেআউট (মোবাইলে নিচে নিচে, ডেক্সটপে পাশাপাশি) */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 🟩 বাম পাশ: অ্যাড নিউ ডিপার্টমেন্ট ফর্ম */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 lg:col-span-1">
         {/* ফর্মের শিরোনাম */}
        <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-indigo-500" />
        <span>{isEditing ? 'Update Department Details' : 'Create New Department'}</span>
        </h3>

          {/* অ্যালার্ট ব্যানারসমূহ */}
          {successMsg && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold">
              {successMsg}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Department Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Human Resources"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-gray-400" /> Department Code *
              </label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. HR"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 uppercase"
              />
            </div>

          {/* ডাইনামিক বাটন (Save / RefreshCw Icons) */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-3"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating Cluster...' : 'Saving Cluster...'}
              </span>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Update Department</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Save Department</span>
                  </>
                )}
              </>
            )}
          </button>

          {isEditing && (
            <button 
              type="button" 
              onClick={() => { setIsEditing(false); setFormData({ name: '', code: '' }); }}
              className="w-full mt-2 bg-gray-100 text-gray-600 font-semibold py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Cancel Edit
            </button>
          )}




          </form>
        </div>

        {/* 🟪 ডান পাশ: ডিপার্টমেন্টের রেসপন্সিভ তালিকা */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden lg:col-span-2 flex flex-col">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">
            Active Corporate Nodes ({departments.length})
            </h3>
        </div>

        {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium">Loading Departments Data...</div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
                    <th className="px-6 py-3.5">System Code</th>
                    <th className="px-6 py-3.5">Department Identity Name</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
                </thead>
                
                {/* 💡 এখানে divide-y divide-gray-200 ক্লাসটি যুক্ত করা হয়েছে যা প্রতিটি রো-এর নিচে বর্ডার দিবে */}
                <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
                {departments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50/80 transition duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs">
                        {dept.code}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{dept.name}</td>
                    <td className="px-6 py-4 text-center">
                        {/* ✏️ Lucide Edit3 Icon */}
                        <button 
                        onClick={() => handleEditClick(dept)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
                        >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                        </button>

                        {/* 🗑️ Lucide Trash2 Icon */}
                        <button 
                        onClick={() => handleDelete(dept._id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
                        >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {departments.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-medium bg-white">
                No departments found in the ERP node tree.
                </div>
            )}
            </div>
        )}
        </div>


      </div>
    </div>
  );
};

export default DepartmentPanel;
