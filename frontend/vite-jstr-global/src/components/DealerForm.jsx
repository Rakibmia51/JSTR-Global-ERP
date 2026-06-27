import { useState } from 'react';
import axios from 'axios';
import { Briefcase, Image, Save, User } from 'lucide-react';

const DealerForm = () => {
  const [formData, setFormData] = useState({
    dealerId: '',
    referenceIdNo: '',
    district: '',
    thana: '',
    name: '',
    dateOfBirth: '',
    nationalIdNo: '',
    fathersName: '',
    mothersName: '',
    mobilePhoneNo: '',
    email: '',
    address: '',
  });

    
    const [photoPreview, setPhotoPreview] = useState(null);
    const [nidPhotoPreview, setNidPhotoPreview] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [nidPhoto, setNidPhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // টেক্সট ইনপুট চেঞ্জ হ্যান্ডলার
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live image selection and file preview handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check for 2MB limit before assigning states
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (e.target.name === 'photo') {
      setPhoto(file);
      setPhotoPreview(previewUrl);
    } else if (e.target.name === 'nidPhoto') {
      setNidPhoto(file);
      setNidPhotoPreview(previewUrl);
    }
  };

    // Form submission handler
    const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const data = new FormData();
    
    // Append all text input fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append file objects
    if (photo) data.append('photo', photo);
    if (nidPhoto) data.append('nidPhoto', nidPhoto);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/dealers/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({
            type: 'success',
            text: 'Dealer Registered Successfully! All profile data and attachments are stored.'
        });
        // Reset states
        setFormData({
          dealerId: '', referenceIdNo: '', district: '', thana: '',
          name: '', dateOfBirth: '', nationalIdNo: '', fathersName: '',
          mothersName: '', mobilePhoneNo: '', email: '', address: ''
        });
        setPhoto(null);
        setNidPhoto(null);
        setPhotoPreview(null);
        setNidPhotoPreview(null);
        e.target.reset();
      }
    } catch (error) {
      setIsError(true);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred while registering the dealer.'
      });
    } finally {
      setLoading(false);
    }
    }

  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
      {/* শিরোনাম */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold">Add New Dealer</h2>
      </div>

      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
         {/* 🏢 সেকশন ১: অফিসিয়াল অ্যান্ড সিকিউরিটি সেটিংস */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
            <span>Official Configurations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dealer ID *</label>
              <input type="text" name="dealerId" required value={formData.dealerId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="e.g. DEALER001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference ID No</label>
              <input type="text" name="referenceIdNo" value={formData.referenceIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
           
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thana</label>
              <input type="text" name="thana" value={formData.thana} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
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
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Official Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="name@company.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Primary Mobile No *</label>
              <input type="text" name="mobilePhoneNo" required value={formData.mobilePhoneNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="017XXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">National ID (NID) *</label>
              <input type="text" name="nationalIdNo" required value={formData.nationalIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
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
              <input type="text" name="fathersName" required value={formData.fathersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mother's Name *</label>
              <input type="text" name="mothersName" required value={formData.mothersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
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
                Saving Dealer...
            </span>
            ) : (
            <>
                {/* 💾 লুসিড সেভ আইকন */}
                <Save className="w-5 h-5 text-white stroke-[2.5]" />
                <span>Save Dealer</span>
            </>
            )}
        </button>
        </div>
        
      </form>
    </div>
  );
};

export default DealerForm;
