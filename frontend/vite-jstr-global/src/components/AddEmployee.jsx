import React, { useEffect, useState } from 'react'
import { Briefcase, User, MapPin, ShieldCheck, Image, Save } from 'lucide-react';

const AddEmployee = () => {

      // ডাটাবেস স্কিমা অনুযায়ী স্টেট ডিজাইন
    const [formData, setFormData] = useState({
        idNo: '', refIdNo: '', name: '', email: '', password: '', role: 'staff',
        department: '', gender: 'Male', dateOfBirth: '', nidNo: '', fatherName: '',
        motherName: '', spouseName: '', mobileNo: '', address: '', district: '', thana: '',
        nominee: {
        name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: ''
        }
    });

   
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });


    
    // ১. সাধারণ ইনপুট ফিল্ড ট্র্যাক করার জন্য
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ২. নেস্টেড নমিনি অবজেক্টের ফিল্ড ট্র্যাক করার জন্য
    const handleNomineeChange = (e) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        nominee: { ...formData.nominee, [name]: value }
        });
    };

 
    // ৩. ফর্ম সাবমিট করে ব্যাকএন্ডে ছবিসহ ডাটা পাঠানো (Updated for Multi-part Form Data)
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
        const formDataToSend = new FormData();
        const token = localStorage.getItem('token'); 

        // ১️⃣ রুট লেভেলের সমস্ত সাধারণ টেক্সট ডাটা যুক্ত করুন (nominee ছাড়া)
        Object.keys(formData).forEach((key) => {
        if (key !== 'nominee') {
            formDataToSend.append(key, formData[key]);
        }
        });

        // ২️⃣ অত্যন্ত গুরুত্বপূর্ণ: পুরো নমিনি অবজেক্টটিকে স্ট্রিং বানিয়ে একসাথে পুশ করুন
        // এতে করে নমিনির সব ডেটা (nidNo, relation, fatherName) একসাথে ব্যাকএন্ডে যাবে
        formDataToSend.append('nominee', JSON.stringify(formData.nominee));

        // ৩️⃣ ইমেজ ফাইল দুটি যুক্ত করুন (যদি সিলেক্ট করা থাকে)
        if (photoFile) formDataToSend.append('photo', photoFile);
        if (nomineePhotoFile) formDataToSend.append('nomineePhoto', nomineePhotoFile);

        // ৪️⃣ ব্যাকএন্ড এপিআই-তে রিকোয়েস্ট পাঠান
        const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // আপনার অথ মিডলওয়্যার পাস করার জন্য
        },
        body: formDataToSend 
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Employee and Nominee registered successfully!'});
        
        // ফর্মের টেক্সট ডাটা রিসেট করা
        setFormData({
            idNo: '', refIdNo: '', name: '', email: '', password: '', role: 'staff',
            department: '', gender: 'Male', dateOfBirth: '', nidNo: '', fatherName: '',
            motherName: '', spouseName: '', mobileNo: '', photo: '',
            address: '', district: '', thana: '',
            nominee: { name: '', fatherName: '', motherName: '', dateOfBirth: '', nidNo: '', relation: '', mobileNo: '', photo: 'default-nominee.png' }
        });

        // ইমেজ ফাইল এবং প্রিভিউ রিসেট করা
        setPhotoFile(null);
        setPhotoPreview(null);
        setNomineePhotoFile(null);
        setNomineePhotoPreview(null);

        } else {
        setMessage({ type: 'error', text: result.message || 'Validation failed!' });
        }
    } catch (err) {
        setMessage({ type: 'error', text: '❌ Failed to connect to server!' });
        console.error(err);
    } finally {
        setLoading(false);
    }
    };




    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [nomineePhotoFile, setNomineePhotoFile] = useState(null);
    const [nomineePhotoPreview, setNomineePhotoPreview] = useState(null);

    // ১. কর্মচারীর প্রোফাইল ছবি হ্যান্ডলার
    const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file)); // ব্রাউজার প্রিভিউ ইউআরএল তৈরি
    }
    };

    // ২. নমিনির ছবি হ্যান্ডলার
    const handleNomineePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNomineePhotoFile(file);
        setNomineePhotoPreview(URL.createObjectURL(file));
    }
    };

     const [departments, setDepartments] = useState([]); // ড্রপডাউনের জন্য
    const [deptLoading, setDeptLoading] = useState(true); // ডিপার্টমেন্ট লোডিং ট্র্যাকার

    useEffect(() => {
    const fetchDepartments = async () => {
        try {
        setDeptLoading(true);
        const token = localStorage.getItem('token'); 

        const response = await fetch('http://localhost:3000/api/departments', {
            headers: {
            'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        // এপিআই রেসপন্স অনুযায়ী ডাটা সেটিং
        if (result.success) {
            setDepartments(result.data); // আপনার এপিআই থেকে আসা 'data' অ্যারে সেভ হচ্ছে
        }
        } catch (err) {
        console.error('Error fetching departments:', err);
        } finally {
        setDeptLoading(false);
        }
    };

    fetchDepartments();
    }, []);

  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
      
      {/* শিরোনাম */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold">Add New Employee</h2>
      </div>

      {/* অ্যালার্ট বা নোটিফিকেশন */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* মূল ফর্ম */}
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
              <input type="text" name="idNo" required value={formData.idNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="e.g. ADMIN001" />
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Department Assignment *</label>
              
             <select 
    name="department" 
    required 
    value={formData.department} 
    onChange={handleChange} 
    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer"
  >
    {/* ডিপার্টমেন্ট লোড হতে থাকলে ইউজারকে নোটিফাই করবে */}
    {deptLoading ? (
      <option value="">Loading Departments...</option>
    ) : (
      <option value="">Select Department</option>
    )}

    {/* ডেটাবেস থেকে আসা ডিপার্টমেন্টের ডাটা লুপ চালিয়ে অপশনে বসানো হচ্ছে */}
    {!deptLoading && departments && departments.map((dept) => (
      <option key={dept._id} value={dept._id}>
        {dept.name} ({dept.code})
      </option>
    ))}
  </select>


            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Secure Password *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Minimum 6 characters" />
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
              <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
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
                value={formData.nominee.dateOfBirth} 
                onChange={handleNomineeChange} 
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

       
        {/* সেকশন ৬: সাবমিট বাটন */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
        <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
            <span className="flex items-center gap-2 justify-center">
                {/* লুপ লোডিং স্পিনার */}
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Employee...
            </span>
            ) : (
            <>
                {/* 💾 লুসিড সেভ আইকন */}
                <Save className="w-5 h-5 text-white stroke-[2.5]" />
                <span>Save Employee</span>
            </>
            )}
        </button>
        </div>


      </form>



    </div>
  )
}

export default AddEmployee