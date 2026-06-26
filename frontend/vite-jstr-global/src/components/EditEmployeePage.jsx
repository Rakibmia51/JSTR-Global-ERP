import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, User, Briefcase, ShieldCheck, Image, ArrowLeft, MapPin } from 'lucide-react';

const EditEmployeePage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const API_BASE_URL = 'http://localhost:3000/api';

  const [formData, setFormData] = useState({
    idNo: '', refIdNo: '', name: '', email: '', password: '', role: 'staff',
    department: '', gender: 'Male', dateOfBirth: '', nidNo: '', fatherName: '',
    motherName: '', spouseName: '', mobileNo: '', photo: '',
    address: '', district: '', thana: '',
    nominee: { name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: '', photo: '' }
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); 
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [nomineePhotoFile, setNomineePhotoFile] = useState(null);
  const [nomineePhotoPreview, setNomineePhotoPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch Employee Details by ID
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          const employee = response.data.data;
          setFormData({
            ...employee,
            department: typeof employee.department === 'object' ? employee.department?._id : employee.department || '',
            nominee: employee.nominee || { name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: '' }
          });

          if (employee.photo) setPhotoPreview(`http://localhost:3000/${employee.photo}`);
          if (employee.nominee?.photo) setNomineePhotoPreview(`http://localhost:3000/${employee.nominee.photo}`);
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        alert('Failed to load employee data.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  // 2. Fetch Departments List
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

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      nominee: { ...formData.nominee, [name]: value }
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNomineePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNomineePhotoFile(file);
      setNomineePhotoPreview(URL.createObjectURL(file));
    }
  };

  // Safe Date Formatting (yyyy-MM-dd)
  const inputDateValue = formData.dateOfBirth?.split('T')[0] || '';
  const inputNomineeDateValue = formData.nominee?.dateOfBirth?.split('T')[0] || '';

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: `${selectedDate}T00:00:00.000Z` });
    }
  };

  const handleNomineeDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      setFormData({
        ...formData,
        nominee: { ...formData.nominee, dateOfBirth: `${selectedDate}T00:00:00.000Z` }
      });
    }
  };

  // Submit Updated Multi-part Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== 'nominee' && key !== 'photo') {
          data.append(key, formData[key]);
        }
      });

      data.append('nominee', JSON.stringify(formData.nominee));

      if (photoFile) data.append('photo', photoFile);
      if (nomineePhotoFile) data.append('nomineePhoto', nomineePhotoFile);

      const response = await axios.put(`${API_BASE_URL}/users/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Employee records updated successfully!' });
        //navigate('/employees'); 
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error executing update.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Loading employee profiles...</p>
      </div>
    );
  }



  
  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
        
        {/* Header section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl shadow-md">
          <button 
            onClick={() => navigate('/admin-panel/employees/all')} 
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <User size={22} className="text-blue-400" /> Modify Employee Profile
          </h2>
          <div className="hidden sm:block w-24"></div>
        </div>


          {/* অ্যালার্ট বা নোটিফিকেশন */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* আপনার আগের মডালের পুরো এডিট ফর্ম UI এখানে ডিজাইন করুন */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
        
            {/* 🏢 সেকশন ১: অফিসিয়াল অ্যান্ড সিকিউরিটি সেটিংস */}
            <div className="space-y-4">
                 <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                    <Briefcase className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                    <span>Official Configurations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Employee ID *</label>
                        <input type="text" name="idNo" required value={formData.idNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="e.g. ADMIN001" disabled/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference ID No</label>
                        <input type="text" name="refIdNo" value={formData.refIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">System Role *</label>
                        <select name="role" required value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                        </select>
                    </div>
                </div>
            </div>
            {/* 👤 সেকশন ২: পার্সোনাল অ্যান্ড প্রোফাইল প্যারামিটারস */}
            <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                    <User className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                    <span>Bio-Data & Core Personal Identifiers</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Employee Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Official Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="name@company.com" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Primary Mobile No *</label>
                    <input type="text" name="mobileNo" required value={formData.mobileNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="017XXXXXXXX" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">National ID (NID) *</label>
                    <input type="text" name="nidNo" required value={formData.nidNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" required value={inputDateValue} onChange={handleDateChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
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

            {/* 🗺️ সেকশন ৩: জিওগ্রাফিক্যাল অ্যাড্রেস প্রোপার্টিজ */}
            <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                    <span>Residential Address Parameters</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District *</label>
                    <input 
                        type="text" 
                        name="district" 
                        required 
                        value={formData.district} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" 
                        placeholder="e.g. Dhaka" 
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thana *</label>
                    <input 
                        type="text" 
                        name="thana" 
                        required 
                        value={formData.thana} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" 
                        placeholder="e.g. Mirpur" 
                    />
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Street Address / House *</label>
                    <input 
                        type="text" 
                        name="address" 
                        required 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" 
                        placeholder="e.g. House #12, Road #4" 
                    />
                    </div>
                </div>
            </div>

            {/* 🛡️ সেকশন ৪: নমিনি রিলেশন ডিপেন্ডেন্সি (Nested Object Structure) */}
            <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-3 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
                <span>Legal Nominee Dependencies (Insurance/Provident)</span>
            </h3>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100/70">
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee Full Name *</label>
                <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.nominee.name} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="Nominee Name" 
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Relationship *</label>
                <input 
                    type="text" 
                    name="relation" 
                    required 
                    value={formData.nominee.relation} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="e.g. Spouse, Mother, Brother" 
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee Contact No *</label>
                <input 
                    type="text" 
                    name="mobileNo" 
                    required 
                    value={formData.nominee.mobileNo} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="01XXXXXXXXX" 
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee NID No *</label>
                <input 
                    type="text" 
                    name="nidNo" 
                    required 
                    value={formData.nominee.nidNo} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="Nominee NID"
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee Date of Birth *</label>
                <input 
                    type="date" 
                    name="dateOfBirth" 
                    required 
                    value={inputNomineeDateValue} 
                    onChange={handleNomineeDateChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="Date of Birth"
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee Father's Name *</label>
                <input 
                    type="text" 
                    name="fatherName" 
                    required 
                    value={formData.nominee.fatherName} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="Nominee Father Name"
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nominee Mother's Name *</label>
                <input 
                    type="text" 
                    name="motherName" 
                    required 
                    value={formData.nominee.motherName} 
                    onChange={handleNomineeChange} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" 
                    placeholder="Nominee Mother's Name"
                />
                </div>
            </div>
            </div>

            {/* 📸 সেকশন ৫: ডকুমেন্ট ও ফটো আপলোড প্যারামিটারস */}
            <div className="space-y-4 mt-6">
                <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                    <Image className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                    <span>Profile & Nominee Attachments</span>
                </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                
                {/* কর্মচারীর ছবি আপলোড */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                    {photoPreview ? (
                    <img src={photoPreview} alt="Employee Preview" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-xs text-gray-400 font-semibold uppercase">No Photo</span>
                    )}
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Employee Attachment</label>
                    <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                </div>
                </div>

                {/* নমিনির ছবি আপলোড */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden bg-emerald-50/20 shrink-0">
                    {nomineePhotoPreview ? (
                    <img src={nomineePhotoPreview} alt="Nominee Preview" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-xs text-emerald-600/60 font-semibold uppercase">No Photo</span>
                    )}
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Nominee Attachment</label>
                    <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleNomineePhotoChange} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                </div>
                </div>

            </div>
            </div>


        {/* সাবমিট বাটন */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-6 border-t border-gray-200">
        <button 
            type="button" 
            onClick={() => navigate('/admin-panel/employees/all')} 
            className="w-full sm:w-auto text-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 transition active:scale-98"
        >
            Cancel
        </button>
        
        <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
            <>
                {/* Modern CSS Loading Spinner */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
            </>
            ) : (
            <>
                <Save size={18} />
                Save Changes
            </>
            )}
        </button>
        </div>


      </form>
    </div>
  );
};

export default EditEmployeePage;
