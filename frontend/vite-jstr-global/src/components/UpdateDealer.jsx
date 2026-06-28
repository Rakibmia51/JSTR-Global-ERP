import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  Save , Briefcase, User, Image, ArrowLeft} from 'lucide-react';


const UpdateDealer = () => {
    const { id } = useParams(); // URL থেকে ডিলারের আইডি নেওয়ার জন্য (যেমন: /dealers/edit/:id)
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [message, setMessage] = useState('');

    // ফর্ম স্টেট (সব টেক্সট ফিল্ড)
    const [formData, setFormData] = useState({
        dealerId: '', password: '', referenceIdNo: '', district: '', thana: '', status: '',
        name: '', dateOfBirth: '', nationalIdNo: '', fathersName: '', mothersName: '',
        mobilePhoneNo: '', email: '', address: ''
    });

    // ফাইল বা ইমেজের জন্য আলাদা স্টেট
    const [photo, setPhoto] = useState(null);
    const [nidPhoto, setNidPhoto] = useState(null);

    // আগের ইমেজের প্রিভিউ বা ইউআরএল রাখার জন্য স্টেট
    const [existingPhoto, setExistingPhoto] = useState('');
    const [existingNidPhoto, setExistingNidPhoto] = useState('');


    const [photoPreview, setPhotoPreview] = useState('');
    const [nidPhotoPreview, setNidPhotoPreview] = useState('');


    // ১. প্রথমে ডিলারের বর্তমান ডেটা ব্যাকএন্ড থেকে লোড করা
    useEffect(() => {
        const fetchDealerDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/dealers/${id}`);
                if (response.data.success) {
                    const dealer = response.data.data;
                    
                    // টেক্সট ফিল্ডগুলো স্টেটে সেট করা
                    setFormData({
                        dealerId: dealer.dealerId || '',
                        password: dealer.password || '', // সিকিউরিটির জন্য ফাঁকাও রাখতে পারেন
                        referenceIdNo: dealer.referenceIdNo || '',
                        district: dealer.district || '',
                        thana: dealer.thana || '',
                        status: dealer.status || '',
                        name: dealer.name || '',
                        dateOfBirth: dealer.dateOfBirth ? dealer.dateOfBirth.split('T')[0] : '', // Date format fix
                        nationalIdNo: dealer.nationalIdNo || '',
                        fathersName: dealer.fathersName || '',
                        mothersName: dealer.mothersName || '',
                        mobilePhoneNo: dealer.mobilePhoneNo || '',
                        email: dealer.email || '',
                        address: dealer.address || ''
                    });

                    // আগের ইমেজের পাথ সেভ রাখা (যদি নতুন ইমেজ আপলোড না করা হয়)
                    setExistingPhoto(dealer.photo || '');
                    setExistingNidPhoto(dealer.nidPhoto || '');
                   // --- 🌟 আপডেট: ইনিশিয়াল প্রিভিউ সেট করা (ব্যাকএন্ড ইউআরএল অনুযায়ী) ---
                    if (dealer.photo) {
                        setPhotoPreview(`http://localhost:3000/${dealer.photo}`);
                    }
                    if (dealer.nidPhoto) {
                        setNidPhotoPreview(`http://localhost:3000/${dealer.nidPhoto}`);
                    }
                }
            } catch (err) {
                console.error("Error fetching dealer:", err);
                setError("Failed to load dealer details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDealerDetails();
    }, [id]);

    // ইনপুট ফিল্ড চেঞ্জের হ্যান্ডলার
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPhoto(file); // ব্যাকএন্ডে পাঠানোর ফাইল স্টেট
        setPhotoPreview(URL.createObjectURL(file)); // লাইভ প্রিভিউ জেনারেট

        setNidPhoto(file); // NID ফাইল স্টেট
        setNidPhotoPreview(URL.createObjectURL(file)); // NID প্রিভিউ জেনারেট 
    }
    };


    // ২. ফর্ম সাবমিট ও ব্যাকএন্ডে PUT রিকোয়েস্ট পাঠানো
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        setMessage('');

        // ফাইল সহ ডেটা পাঠানোর জন্য FormData অবজেক্ট তৈরি
        const data = new FormData();

        // সব টেক্সট ফিল্ড FormData-তে অ্যাপেন্ড (Append) করা
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        // যদি ইউজার নতুন কোনো ছবি সিলেক্ট করে, তবে ফাইল যাবে। না করলে আগের পাথের টেক্সট যাবে।
        if (photo) {
            data.append('photo', photo);
        } else {
            data.append('photo', existingPhoto);
        }

        if (nidPhoto) {
            data.append('nidPhoto', nidPhoto);
        } else {
            data.append('nidPhoto', existingNidPhoto);
        }

        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:3000/api/dealers/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data' // ফাইল পাঠানোর জন্য আবশ্যিকsetHeader
                }
            });

            if (response.data.success) {
                setSuccess('Dealer updated successfully!');
                setMessage({ type: 'success', text: 'Dealer updated successfully! Redirecting to list...' });
            }
        } catch (err) {
            console.error("Update failed:", err);
            setError(err.response?.data?.message || "An error occurred while updating the dealer.");
            setMessage({ type: 'error', text: err.response?.data?.message || "An error occurred while updating the dealer." });
        } finally {
            setLoading(false);
        }
    };


    return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">

       {/* Header section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl shadow-md">
          <button 
            onClick={() => navigate('/admin-panel/dealer/all')} 
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <User size={22} className="text-blue-400" /> Modify Dealer Profile
          </h2>
          <div className="hidden sm:block w-24"></div>
        </div>

      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
         {/* 🏢 সেকশন ১: অফিসিয়াল অ্যান্ড সিকিউরিটি সেটিংস */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
            <span>Official Configurations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dealer ID *</label>
              <input type="text" name="dealerId" required value={formData.dealerId} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="e.g. DEALER001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference ID No</label>
              <input type="text" name="referenceIdNo" value={formData.referenceIdNo} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Secure Password *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Minimum 6 characters" />
            </div>
            
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account Status *</label>
              <select name="status" required value={formData.status || 'Active'} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
           
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thana</label>
              <input type="text" name="thana" value={formData.thana} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
          </div>
        </div>

         {/* 👤 সেকশন ২: পার্সোনাল অ্যান্ড প্রোফাইল প্যারামিটারস */}
        <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                <User className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                <span>Personal Identifiers</span>
            </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Employee Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Official Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="name@company.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Primary Mobile No *</label>
              <input type="text" name="mobilePhoneNo" required value={formData.mobilePhoneNo} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="017XXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">National ID (NID) *</label>
              <input type="text" name="nationalIdNo" required value={formData.nationalIdNo} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date of Birth *</label>
              <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Gender Specifier *</label>
              <select name="gender" required value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Father's Name *</label>
              <input type="text" name="fathersName" required value={formData.fathersName} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mother's Name *</label>
              <input type="text" name="mothersName" required value={formData.mothersName} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* 📸 সেকশন ৩: ডকুমেন্ট ও ফটো আপলোড প্যারামিটারস */}
        <div className="space-y-4 mt-6">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
                <Image className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
                <span>Profile & Nominee Attachments</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200">
        
                {/* 1. Dealer Profile Photo Upload Block */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                    {/* Profile Circular Preview Box */}
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 shadow-inner">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Dealer Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center px-1">No Photo</span>
                        )}
                    </div>
                    
                    {/* File Input Controller */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wide">Dealer Attachment *</label>
                        <input 
                            type="file" 
                            name="photo" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            required={!formData?.status} // Optional in edit mode, required in create mode
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                        />
                    </div>
                </div>

                {/* 2. National ID Card Photo Upload Block */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                    {/* NID Card Rectangle Preview Box (Optimized for Card dimensions instead of circle) */}
                    <div className="w-28 h-20 rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden bg-emerald-50/20 shrink-0 shadow-inner">
                        {nidPhotoPreview ? (
                            <img src={nidPhotoPreview} alt="NID Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider text-center px-1">No NID Photo</span>
                        )}
                    </div>
                    
                    {/* File Input Controller */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5 tracking-wide">NID Attachment *</label>
                        <input 
                            type="file" 
                            name="nidPhoto" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            required={!formData?.status} // Optional in edit mode, required in create mode
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer"
                        />
                    </div>
                </div>

            </div>

        </div>

        {/* অ্যালার্ট বা নোটিফিকেশন */}
        {message && (
            <div className={`p-4 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
           
            </div>
        )}

        {/* সেকশন ৪: সাবমিট বাটন */}
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
                Saving Changes...
            </span>
            ) : (
            <>
                {/* 💾 লুসিড সেভ আইকন */}
                <Save className="w-5 h-5 text-white stroke-[2.5]" />
                <span>Save Changes</span>
            </>
            )}
        </button>
        </div>
        
      </form>
    </div>
  );


}

export default UpdateDealer;