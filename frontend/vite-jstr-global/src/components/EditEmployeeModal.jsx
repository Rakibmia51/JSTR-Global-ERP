import  { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Save, User, Briefcase, ShieldCheck, Image } from 'lucide-react';


const EditEmployeeModal = ({ employee, onClose, fetchEmployees }) => {
  const API_BASE_URL = 'http://localhost:3000/api';
    

  // ডাটাবেজ স্কিমা অনুযায়ী স্টেট ডিজাইন
  const [formData, setFormData] = useState({
            idNo: '', refIdNo: '', name: '', email: '', password: '', role: 'staff',
            department: '', gender: 'Male', dateOfBirth: '', nidNo: '', fatherName: '',
            motherName: '', spouseName: '', mobileNo: '', photo: '',
            address: '', district: '', thana: '',
            nominee: { name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: '', photo: '' }
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  // নতুন আপলোডের জন্য ইমেজ ফাইল এবং প্রিভিউ স্টেট
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [nomineePhotoFile, setNomineePhotoFile] = useState(null);
  const [nomineePhotoPreview, setNomineePhotoPreview] = useState(null);

  // ১. মডাল ওপেন হলে কর্মচারীর আগের ডাটা ফর্মে সেট করা
  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        department: typeof employee.department === 'object' ? employee.department?._id : employee.department || '',
        nominee: employee.nominee || { name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: '' }
      });

      // আগের ছবিগুলোর প্রিভিউ সেট করা (যদি সার্ভারে থাকে)
      if (employee.photo) setPhotoPreview(`http://localhost:3000/${employee.photo}`);
      if (employee.nominee?.photo) setNomineePhotoPreview(`http://localhost:3000/${employee.nominee.photo}`);
    }
  }, [employee]);

  // ২. ডাইনামিক ডিপার্টমেন্ট লিস্ট ফেচ করা
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/departments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) setDepartments(result.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepartments();
  }, []);

    // সাধারণ ইনপুট হ্যান্ডলার
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // নেস্টেড নমিনি ইনপুট হ্যান্ডলার
  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      nominee: { ...formData.nominee, [name]: value }
    });
  };

  // কর্মচারীর ছবি পরিবর্তন হ্যান্ডলার
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // নমিনির ছবি পরিবর্তন হ্যান্ডলার
  const handleNomineePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNomineePhotoFile(file);
      setNomineePhotoPreview(URL.createObjectURL(file));
    }
  };

  // ফর্ম সাবমিট করে ডাটা ব্যাকএন্ডে আপডেট করা (PUT Request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      // রুট লেভেলের ডাটা অ্যাপেন্ড করা (nominee ছাড়া)
      Object.keys(formData).forEach((key) => {
        if (key !== 'nominee' && key !== 'photo') {
          data.append(key, formData[key]);
        }
      });

      // নমিনি অবজেক্টকে স্ট্রিং বানিয়ে পুশ করা
      data.append('nominee', JSON.stringify(formData.nominee));

      // যদি নতুন ছবি সিলেক্ট করা হয় তবেই যুক্ত হবে
      if (photoFile) data.append('photo', photoFile);
      if (nomineePhotoFile) data.append('nomineePhoto', nomineePhotoFile);

      const response = await axios.put(`${API_BASE_URL}/users/${employee._id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('কর্মচারীর ডাটা সফলভাবে আপডেট করা হয়েছে!');
        fetchEmployees(); // মূল টেবিলের ডাটা রিফ্রেশ করা
        onClose(); // মডাল বন্ধ করা
      }
    } catch (err) {
      alert(err.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ডেট ইনপুটের জন্য ফরম্যাটিং

  const inputDateValue = formData.dateOfBirth?.split('T')[0];

  const handleDateChange = (e) => {
    const selectedDate = e.target.value; // আউটপুট পাবেন: "YYYY-MM-DD"
    
    if (selectedDate) {
      // ৪. নতুন তারিখের সাথে পুনরায় 'T00:00:00.000Z' যোগ করে ISO ফরম্যাট বানানো হলো
      const updatedIsoDate = `${selectedDate}T00:00:00.000Z`;
      
      // ৫. স্টেটে নতুন ISO ডেট সেট করা হলো (যা আপনি API দিয়ে ব্যাকএন্ডে পাঠাবেন)
      setFormData({ ...formData, dateOfBirth: updatedIsoDate });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-transform duration-300">
        
        {/* 🔝 মডাল হেডার */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold">Update Employee Details</h2>
            <p className="text-xs text-indigo-100">Editing: {formData.name} ({formData.idNo})</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📝 মূল ফর্ম বডি */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* 🏢 সেকশন ১: অফিসিয়াল সেটিংস */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase border-b pb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Official Configurations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee ID *</label>
                <input type="text" name="idNo" required value={formData.idNo} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ref. ID *</label>
                <input type="text" name="refIdNo" required value={formData.refIdNo} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System Role *</label>
                <select name="role" required value={formData.role} onChange={handleChange} 
                   className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department *</label>
                <select name="department" required value={formData.department} onChange={handleChange} 
                   className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
               
            </div>
          </div>

          {/* 👤 সেকশন ২: পার্সোনাল ডাটা */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase border-b pb-2 flex items-center gap-2"><User className="w-4 h-4" /> Personal Bio-Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile No *</label>
                <input type="text" name="mobileNo" required value={formData.mobileNo} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NID No *</label>
                <input type="text" name="nidNo" required value={formData.nidNo} onChange={handleChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth *</label>
                <input type="date" name="dateOfBirth" required value={inputDateValue} onChange={handleDateChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Gender Specifier *</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                 <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Father's Name *</label>
              <input type="text" name="fatherName" required value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mother's Name *</label>
              <input type="text" name="motherName" required value={formData.motherName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Spouse Name (If Applicable)</label>
              <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
            </div>
          </div>

          {/* 🛡️ সেকশন ৩: নমিনি ডাটা */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase border-b border-emerald-100 pb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Nominee Dependencies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nominee Name *</label>
                <input type="text" name="name" required value={formData.nominee.name} onChange={handleNomineeChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Relationship *</label>
                <input type="text" name="relation" required value={formData.nominee.relation} onChange={handleNomineeChange} 
                className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact No *</label>
                <input type="text" name="mobileNo" required value={formData.nominee.mobileNo} onChange={handleNomineeChange} 
                 className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"  />
              </div>
            </div>
          </div>

          {/* 📸 সেকশন ৪: ইমেজ আপডেট */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase border-b pb-2 flex items-center gap-2"><Image className="w-4 h-4" /> Media Attachments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 border  border-gray-300 p-3 rounded-xl">
                <div className="w-14 h-14 rounded-full border overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                  {photoPreview ? <img src={photoPreview} alt="Emp" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Change Employee Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-4 border  border-gray-300 p-3 rounded-xl">
                <div className="w-14 h-14 rounded-full border overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                  {nomineePhotoPreview ? <img src={nomineePhotoPreview} alt="Nom" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Change Nominee Photo</label>
                  <input type="file" accept="image/*" onChange={handleNomineePhotoChange} className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* 💾 অ্যাকশন বাটন্স */}
          <div className="pt-4 border-t flex justify-end gap-3 bg-white sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-xl hover:bg-gray-50 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 cursor-pointer">
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Updates'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
