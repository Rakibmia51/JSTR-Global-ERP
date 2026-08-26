//1st version of DealerForm.jsx with all required fields and file upload functionality

// import { useState } from 'react';
// import axios from 'axios';
// import { Briefcase, Image, Save, User } from 'lucide-react';

// const DealerForm = () => {
//   const [formData, setFormData] = useState({
//     dealerId: '',
//     password: '',
//     referenceIdNo: '',
//     district: '',
//     thana: '',
//     name: '',
//     dateOfBirth: '',
//     nationalIdNo: '',
//     fathersName: '',
//     mothersName: '',
//     mobilePhoneNo: '',
//     email: '',
//     address: '',
//   });

    
//     const [photoPreview, setPhotoPreview] = useState(null);
//     const [nidPhotoPreview, setNidPhotoPreview] = useState(null);

//   const [photo, setPhoto] = useState(null);
//   const [nidPhoto, setNidPhoto] = useState(null);

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [isError, setIsError] = useState(false);

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

//   // টেক্সট ইনপুট চেঞ্জ হ্যান্ডলার
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Live image selection and file preview handler
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Check for 2MB limit before assigning states
//     if (file.size > 2 * 1024 * 1024) {
//       alert("File size exceeds 2MB limit.");
//       e.target.value = "";
//       return;
//     }

//     const previewUrl = URL.createObjectURL(file);

//     if (e.target.name === 'photo') {
//       setPhoto(file);
//       setPhotoPreview(previewUrl);
//     } else if (e.target.name === 'nidPhoto') {
//       setNidPhoto(file);
//       setNidPhotoPreview(previewUrl);
//     }
//   };

//     // Form submission handler
//     const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setIsError(false);

//     const data = new FormData();
    
//     // Append all text input fields
//     Object.keys(formData).forEach((key) => {
//       data.append(key, formData[key]);
//     });

//     // Append file objects
//     if (photo) data.append('photo', photo);
//     if (nidPhoto) data.append('nidPhoto', nidPhoto);

//     setLoading(true);
//     try {
//       const response = await axios.post(`${SERVER_URL}/api/dealers/register`, data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.success) {
//         setMessage({
//             type: 'success',
//             text: 'Dealer Registered Successfully! All profile data and attachments are stored.'
//         });
//         // Reset states
//         setFormData({
//           dealerId: '',password:'', referenceIdNo: '', district: '', thana: '',
//           name: '', dateOfBirth: '', nationalIdNo: '', fathersName: '',
//           mothersName: '', mobilePhoneNo: '', email: '', address: '', status: 'Active'
//         });
//         setPhoto(null);
//         setNidPhoto(null);
//         setPhotoPreview(null);
//         setNidPhotoPreview(null);
//         e.target.reset();
//       }
//     } catch (error) {
//       setIsError(true);
//       setMessage({
//         type: 'error',
//         text: error.response?.data?.message || 'An error occurred while registering the dealer.'
//       });
//     } finally {
//       setLoading(false);
//     }
//     }

//   return (
//     <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
//       {/* শিরোনাম */}
//       <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
//         <h2 className="text-xl font-bold">Add New Dealer</h2>
//       </div>

      
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
//          {/* 🏢 সেকশন ১: অফিসিয়াল অ্যান্ড সিকিউরিটি সেটিংস */}
//         <div className="space-y-4">
//           <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
//             <Briefcase className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
//             <span>Official Configurations</span>
//           </h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
//             {/* <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dealer ID *</label>
//               <input type="text" name="dealerId" required value={formData.dealerId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="e.g. DEALER001" />
//             </div> */}
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference ID No</label>
//               <input type="text" name="referenceIdNo" value={formData.referenceIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
//             </div>

//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Secure Password *</label>
//               <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Minimum 6 characters" />
//             </div>
            
//              <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account Status *</label>
//               <select name="status" required value={formData.status || 'Active'} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
           
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
//               <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
//             </div>
//              <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thana</label>
//               <input type="text" name="thana" value={formData.thana} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
//             </div>
//           </div>
//         </div>

//          {/* 👤 সেকশন ২: পার্সোনাল অ্যান্ড প্রোফাইল প্যারামিটারস */}
//         <div className="space-y-4">
//             <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
//                 <User className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
//                 <span>Personal Identifiers</span>
//             </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Employee Name *</label>
//               <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Official Email *</label>
//               <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="name@company.com" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Primary Mobile No *</label>
//               <input type="text" name="mobilePhoneNo" required value={formData.mobilePhoneNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="017XXXXXXXX" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">National ID (NID) *</label>
//               <input type="text" name="nationalIdNo" required value={formData.nationalIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date of Birth *</label>
//               <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Gender Specifier *</label>
//               <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Father's Name *</label>
//               <input type="text" name="fathersName" required value={formData.fathersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mother's Name *</label>
//               <input type="text" name="mothersName" required value={formData.mothersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
//               <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
//             </div>
//           </div>
//         </div>

//         {/* 📸 সেকশন ৩: ডকুমেন্ট ও ফটো আপলোড প্যারামিটারস */}
//         <div className="space-y-4 mt-6">
//             <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
//                 <Image className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
//                 <span>Profile & Nominee Attachments</span>
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200">
        
//                 {/* 1. Dealer Profile Photo Upload Block */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
//                     {/* Profile Circular Preview Box */}
//                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 shadow-inner">
//                         {photoPreview ? (
//                             <img src={photoPreview} alt="Dealer Preview" className="w-full h-full object-cover" />
//                         ) : (
//                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center px-1">No Photo</span>
//                         )}
//                     </div>
                    
//                     {/* File Input Controller */}
//                     <div className="flex-1 w-full text-center sm:text-left">
//                         <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wide">Dealer Attachment *</label>
//                         <input 
//                             type="file" 
//                             name="photo" 
//                             accept="image/*" 
//                             onChange={handleFileChange} 
//                             required={!formData?.status} // Optional in edit mode, required in create mode
//                             className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
//                         />
//                     </div>
//                 </div>

//                 {/* 2. National ID Card Photo Upload Block */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
//                     {/* NID Card Rectangle Preview Box (Optimized for Card dimensions instead of circle) */}
//                     <div className="w-28 h-20 rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden bg-emerald-50/20 shrink-0 shadow-inner">
//                         {nidPhotoPreview ? (
//                             <img src={nidPhotoPreview} alt="NID Preview" className="w-full h-full object-cover" />
//                         ) : (
//                             <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider text-center px-1">No NID Photo</span>
//                         )}
//                     </div>
                    
//                     {/* File Input Controller */}
//                     <div className="flex-1 w-full text-center sm:text-left">
//                         <label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5 tracking-wide">NID Attachment *</label>
//                         <input 
//                             type="file" 
//                             name="nidPhoto" 
//                             accept="image/*" 
//                             onChange={handleFileChange} 
//                             required={!formData?.status} // Optional in edit mode, required in create mode
//                             className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer"
//                         />
//                     </div>
//                 </div>

//             </div>

//         </div>

//         {/* অ্যালার্ট বা নোটিফিকেশন */}
//         {message && (
//             <div className={`p-4 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//             {message.text}
           
//             </div>
//         )}

//         {/* সেকশন ৪: সাবমিট বাটন */}
//         <div className="flex justify-end pt-4 border-t border-gray-100">
//         <button 
//             type="submit" 
//             disabled={loading} 
//             className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//             {loading ? (
//             <span className="flex items-center gap-2 justify-center">
//                 {/* লুপ লোডিং স্পিনার */}
//                 <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Saving Dealer...
//             </span>
//             ) : (
//             <>
//                 {/* 💾 লুসিড সেভ আইকন */}
//                 <Save className="w-5 h-5 text-white stroke-[2.5]" />
//                 <span>Save Dealer</span>
//             </>
//             )}
//         </button>
//         </div>
        
//       </form>
//     </div>
//   );
// };

// export default DealerForm;

//2nd version of DealerForm.jsx with all required fields and file upload functionality

import { useState } from 'react';
import axios from 'axios';
import { Briefcase, Image, Save, User } from 'lucide-react';

const DealerForm = () => {
  const [formData, setFormData] = useState({
    password: '',
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
    status: 'Active'
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [nidPhotoPreview, setNidPhotoPreview] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [nidPhoto, setNidPhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

  // টেক্সট ইনপুট চেঞ্জ হ্যান্ডলার
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // লাইভ ইমেজ সিলেকশন ও প্রিভিউ হ্যান্ডলার
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ফাইল সাইজ ২ মেগাবাইটের বেশি কিনা চেক করা
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

  // ফর্ম সাবমিশন হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const data = new FormData();
    
    // টেক্সট ফিল্ডগুলো অ্যাপেন্ড করা
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // ফাইলগুলো অ্যাপেন্ড করা
    if (photo) data.append('photo', photo);
    if (nidPhoto) data.append('nidPhoto', nidPhoto);

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/api/dealers/register`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Dealer Registered Successfully! Generated ID: ${response.data.data.dealerId}`
        });
        
        // ফর্ম স্টেট রিসেট করা
        setFormData({
          password: '', referenceIdNo: '', district: '', thana: '',
          name: '', dateOfBirth: '', nationalIdNo: '', fathersName: '',
          mothersName: '', mobilePhoneNo: '', email: '', address: '', status: 'Active'
        });
        setPhoto(null);
        setNidPhoto(null);
        setPhotoPreview(null);
        setNidPhotoPreview(null);
        e.target.reset();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred while registering the dealer.'
      });
    } finally {
      setLoading(false);
    }
  };

  const bdLocationData = {
      "Chandpur": ["Hajiganj", "Chandpur Sadar", "Faridganj", "Matlab North", "Matlab South", "Kachua", "Shahrasti", "Haimchar"],
      "Dhaka": ["Dhanmondi", "Mirpur", "Gulshan", "Uttara", "Motijheel", "Paltan", "Tejgaon", "Mohammadpur", "Savar", "Keraniganj", "Dhamrai", "Dohar", "Nawabganj"],
      "Chittagong": ["Panchlaish", "Double Mooring", "Hathazari", "Anwara", "Patiya", "Sitakunda", "Raozan", "Sandwip", "Chandgaon", "Boalkhali", "Banshkhali", "Mirsharai", "Rangunia"],
      "Sylhet": ["Sylhet Sadar", "Beanibazar", "Golapganj", "Fenchuganj", "Balaganj", "Biswanath", "Gowainghat", "Zakiganj", "Companiganj", "Jaintiapur", "Kanaighat"],
      "Rajshahi": ["Boalia", "Rajpara", "Paba", "Baghmara", "Godagari", "Tanore", "Puthia", "Charghat", "Durgapur", "Bagha", "Mohonpur"],
      "Khulna": ["Khulna Sadar", "Sonadanga", "Daulatpur", "Khalishpur", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Paikgachha", "Phultala", "Rupa", "Terokhada"],
      "Barisal": ["Barisal Sadar", "Bakerganj", "Babuganj", "Wazirpur", "Banaripara", "Gournadi", "Agailjhara", "Muladi", "Mehendiganj", "Hizla"],
      "Rangpur": ["Rangpur Sadar", "Badarganj", "Mithapukur", "Pirganj", "Gangachara", "Kaunia", "Pirgachha", "Taraganj"],
      "Mymensingh": ["Mymensingh Sadar", "Gaffargaon", "Ishwarganj", "Gouripur", "Muktagachha", "Phulpur", "Bhaluka", "Trishal", "Haluaghat", "Dhobaura", "Nandail", "Tarafund"],
      "Comilla": ["Comilla Sadar", "Chouddagram", "Laksam", "Burichang", "Debidwar", "Homna", "Muradnagar", "Barura", "Chandina", "Daudkandi", "Titas", "Meghna", "Nangalkot"],
      "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"],
      "Narayanganj": ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"],
      "Bogura": ["Bogura Sadar", "Shajahanpur", "Sherpur", "Gabuatali", "Kahaloo", "Nandigram", "Dhunat", "Sariakandi", "Adamdighi", "Dupchanchia", "Shibganj", "Sonatala"],
      "Dinajpur": ["Dinajpur Sadar", "Birganj", "Biral", "Kaharole", "Khansama", "Chirirbandar", "Parbatipur", "Phulbari", "Nawabganj", "Hakimpur", "Ghoraghat"],
      "Jashore": ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chougachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
      "Coxs Bazar": ["Coxs Bazar Sadar", "Ramu", "Chakaria", "Pekua", "Ukhiya", "Teknaf", "Maheshkhali", "Kutubdia"],
      "Brahmanbaria": ["Brahmanbaria Sadar", "Ashuganj", "Sarail", "Nasirnagar", "Nabinagar", "Bancharampur", "Kasba", "Akhaura", "Bijoynagar"],
      "Noakhali": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"],
      "Feni": ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Fulgazi", "Sonagazi"],
      "Lakshmipur": ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
      "Narsingdi": ["Narsingdi Sadar", "Palash", "Belabo", "Monohardi", "Shibpur", "Raipura"],
      "Manikganj": ["Manikganj Sadar", "Singair", "Saturia", "Darirampur", "Gheor", "Shibalaya", "Daulatpur"],
      "Munshiganj": ["Munshiganj Sadar", "Tongibari", "Lauhajang", "Srinagar", "Sirajdikhan", "Gazaria"],
      "Faridpur": ["Faridpur Sadar", "Madhukhali", "Boalmari", "Alfadanga", "Saltha", "Nagarkanda", "Bhanga", "Sadarpur", "Charbhadrasan"],
      "Gopalganj": ["Gopalganj Sadar", "Tungipara", "Kotalipara", "Muksudpur", "Kashiani"],
      "Madaripur": ["Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir"],
      "Rajbari": ["Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"],
      "Shariatpur": ["Shariatpur Sadar", "Damudya", "Naria", "Zajira", "Bhedarganj", "Gosairhat"],
      "Tangail": ["Tangail Sadar", "Mirzapur", "Nagarpur", "Delduar", "Basail", "Kalihati", "Ghatail", "Bhuapur", "Gopalpur", "Madhupur", "Dhanbari", "Sakhipur"],
      "Kishoreganj": ["Kishoreganj Sadar", "Karimganj", "Tarail", "Hossainpur", "Pakundia", "Katiadi", "Bajitpur", "Kuliarchar", "Bhairab", "Nikli", "Mithamain", "Itna", "Astagram"],
      "Netrokona": ["Netrokona Sadar", "Kendua", "Madan", "Khaliajuri", "Mohanganj", "Barhatta", "Durgapur", "Kalmakanda", "Atpara", "Purbadhala"],
      "Sherpur": ["Sherpur Sadar", "Nalitabari", "Sreebardi", "Jhenaigati", "Nakla"],
      "Jamalpur": ["Jamalpur Sadar", "Sarishabari", "Melandaha", "Islampur", "Dewanganj", "Bakshiganj", "Madarganj"],
      "Joypurhat": ["Joypurhat Sadar", "Panchbibi", "Akkelpur", "Kalal", "Kalai"],
      "Naogaon": ["Naogaon Sadar", "Raninagar", "Atrai", "Raniganj", "Mohadevpur", "Dhamoirhat", "Sapahar", "Porsha", "Manda", "Niamatpur", "Badalgachhi"],
      "Natore": ["Natore Sadar", "Baraigram", "Gurudaspur", "Bagatipara", "Lalpur", "Singra", "Naldanga"],
      "Chapainawabganj": ["Nawabganj Sadar", "Shibganj", "Bholahat", "Nachole", "Gomastapur"],
      "Pabna": ["Pabna Sadar", "Ishwardi", "Bhangura", "Chatmohar", "Faridpur", "Santhia", "Bera", "Sujanagar", "Atgharia"],
      "Sirajganj": ["Sirajganj Sadar", "Kazipur", "Ullahpara", "Shahjadpur", "Belkuchi", "Chauhali", "Kamarkhanda", "Raiganj", "Tarash"],
      "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
      "Jhenaidah": ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa", "Harinakunda"],
      "Kushtia": ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Daulatpur", "Bheramara"],
      "Magura": ["Magura Sadar", "Sreepur", "Mohammadpur", "Shalikha"],
      "Meherpur": ["Meherpur Sadar", "Mujibnagar", "Gangni"],
      "Narail": ["Narail Sadar", "Lohagara", "Kalia"],
      "Satkhira": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
      "Chuadanga": ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
      "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
      "Jhalokathi": ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"],
      "Patuakhali": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Dumki", "Rangabali"],
      "Pirojpur": ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
      "Barguna": ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
      "Gaibandha": ["Gaibandha Sadar", "Sadullapur", "Palashbari", "Gobindaganj", "Sundarganj", "Saghata", "Phulchhari"],
      "Kurigram": ["Kurigram Sadar", "Nageshwari", "Bhurungamari", "Phulbari", "Rajarhat", "Ulipur", "Chilmari", "Rowmari", "Char Rajibpur"],
      "Lalmonirhat": ["Lalmonirhat Sadar", "Aditmari", "Kaliganj", "Hatibandha", "Patgram"],
      "Nilphamari": ["Nilphamari Sadar", "Saidpur", "Jaldhaka", "Kishoreganj", "Domar", "Dimla"],
      "Panchagarh": ["Panchagarh Sadar", "Boda", "Debiganj", "Atwari", "Tentulia"],
      "Thakurgaon": ["Thakurgaon Sadar", "Baliadangi", "Ranisankail", "Haripur", "Pirganj"],
      "Habiganj": ["Habiganj Sadar", "Nabiganj", "Bahubal", "Chunarughat", "Madhabpur", "Lakhai", "Baniachong", "Ajmiriganj"],
      "Moulvibazar": ["Moulvibazar Sadar", "Sreemangal", "Rajnagar", "Kamalganj", "Kulaura", "Barlekha", "Juri"],
      "Sunamganj": ["Sunamganj Sadar", "Chhatak", "Jagannathpur", "Derai", "Shallai", "Dharmapasha", "Tahirpur", "Bishwamandarpur", "Doarabazar", "Jamalganj"]
  };


    return (
  <div className="mt-15 p-0 bg-gray-50 min-h-screen flex flex-col gap-6">
    {/* 📢 শিরোনাম ও ব্যানার */}
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold">Add New Dealer</h2>
    </div>

    {/* 🔔 সাকসেস বা এরর মেসেজ ডিসপ্লে */}
    {message && (
      <div className={`mx-6 p-4 rounded-xl font-medium text-sm border ${
        message.type === 'success' 
          ? 'bg-green-50 text-green-800 border-green-200' 
          : 'bg-red-50 text-red-800 border-red-200'
      }`}>
        {message.text}
      </div>
    )}

    {/* 📝 ডিলার রেজিস্ট্রেশন ফর্ম */}
    <form onSubmit={handleSubmit} className="mx-0 bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
      
      {/* 🏢 সেকশন ১: অফিসিয়াল অ্যান্ড সিকিউরিটি সেটিংস (ডাইনামিক ড্রপডাউন এডিশন) */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
          <span>Official Configurations</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          {/* পাসওয়ার্ড ফিল্ড */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Secure Password *</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} minLength={6} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Minimum 6 characters" />
          </div>

          {/* 📍 জেলা ড্রপডাউন (District Select) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District *</label>
            <select 
              name="district" 
              required 
              value={formData.district} 
              onChange={(e) => {
                // জেলা পরিবর্তন হলে থানা ফিল্ড রিসেট করার জন্য কাস্টম হ্যান্ডলার
                handleChange(e);
                setFormData(prev => ({ ...prev, district: e.target.value, thana: '' }));
              }} 
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer"
            >
              <option value="">Select District</option>
              {Object.keys(bdLocationData).map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* 🏙️ থানা/উপজেলা ড্রপডাউন (Dependent Thana Select) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thana / Upazila *</label>
            <select 
              name="thana" 
              required 
              value={formData.thana} 
              onChange={handleChange} 
              disabled={!formData.district} // জেলা সিলেক্ট না করা পর্যন্ত এটি লক থাকবে
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{formData.district ? "Select Thana / Upazila" : "Select District First"}</option>
              {formData.district && bdLocationData[formData.district]?.map((thana) => (
                <option key={thana} value={thana}>{thana}</option>
              ))}
            </select>
          </div>

          {/* রেফারেন্স আইডি */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference ID No</label>
            <input type="text" name="referenceIdNo" value={formData.referenceIdNo} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" placeholder="Optional" />
          </div>
          
          {/* একাউন্ট স্ট্যাটাস */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account Status *</label>
            <select name="status" required value={formData.status || 'Active'} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 cursor-pointer">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Father's Name *</label>
            <input type="text" name="fathersName" required value={formData.fathersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mother's Name *</label>
            <input type="text" name="mothersName" required value={formData.mothersName} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Address *</label>
            <textarea name="address" required value={formData.address} onChange={handleChange} rows="1" className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50/30 resize-none" placeholder="Enter Full Address details..." />
          </div>
        </div>
      </div>

      {/* 🖼️ সেকশন ৩: ফাইল অ্যান্ড ডকুমেন্ট আপলোড (High-Visibility Preview) */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2.5">
          <Image className="w-5 h-5 text-indigo-500 stroke-[2.5]" />
          <span>Required Document Attachments</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 📸 ১ম বক্স: ডিলার প্রোফাইল ফটো (Large Round Preview) */}
          <div className="relative border border-dashed border-gray-300 hover:border-indigo-400 p-6 rounded-xl bg-gray-50/40 hover:bg-indigo-50/10 flex flex-col items-center justify-center transition-all duration-200 group cursor-pointer shadow-sm min-h-[220px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 group-hover:text-indigo-600 transition">
              Upload Dealer Photo *
            </label>
            
            {!photoPreview ? (
              <div className="flex flex-col items-center mb-3 text-gray-400 group-hover:text-indigo-500 transition duration-200">
                <svg className="w-10 h-10 mb-1 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[11px] font-semibold">Avatar Image (Max 2MB)</span>
              </div>
            ) : (
              <div className="relative mb-4 group-hover:scale-105 transition-transform duration-200 ease-out">
                {/* প্রোফাইলের জন্য বড় এবং স্পষ্ট রাউন্ডেড ডিজাইন */}
                <img 
                  src={photoPreview} 
                  alt="Dealer Preview" 
                  className="w-28 h-28 object-cover rounded-full shadow-lg border-2 border-indigo-500 animate-fadeIn" 
                />
              </div>
            )}

            <input 
              type="file" 
              name="photo" 
              accept="image/*" 
              required 
              onChange={handleFileChange} 
              className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition w-full max-w-[220px]" 
            />
          </div>

          {/* 💳 ২য় বক্স: এনআইডি ফটো আপলোড (Large Card Preview) */}
          <div className="relative border border-dashed border-gray-300 hover:border-indigo-400 p-6 rounded-xl bg-gray-50/40 hover:bg-indigo-50/10 flex flex-col items-center justify-center transition-all duration-200 group cursor-pointer shadow-sm min-h-[220px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 group-hover:text-indigo-600 transition">
              Upload NID Photo *
            </label>

            {!nidPhotoPreview ? (
              <div className="flex flex-col items-center mb-3 text-gray-400 group-hover:text-indigo-500 transition duration-200">
                <svg className="w-10 h-10 mb-1 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                <span className="text-[11px] font-semibold">National ID Card (Max 2MB)</span>
              </div>
            ) : (
              <div className="relative mb-4 group-hover:scale-105 transition-transform duration-200 ease-out w-full max-w-[260px] flex justify-center">
                {/* এনআইডি কার্ডের ফ্রেম বড় করা হয়েছে যাতে ভেতরের লেখা স্পষ্ট বোঝা যায় */}
                <img 
                  src={nidPhotoPreview} 
                  alt="NID Preview" 
                  className="w-full h-28 object-contain rounded-xl shadow-lg border-2 border-indigo-500 bg-black/5 p-1 animate-fadeIn" 
                />
              </div>
            )}

            <input 
              type="file" 
              name="nidPhoto" 
              accept="image/*" 
              required 
              onChange={handleFileChange} 
              className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition w-full max-w-[220px]" 
            />
          </div>

        </div>
      </div>

      {/* 🚀 সাবমিট অ্যাকশন বাটন */}
      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Processing Registration...' : 'Save & Register Dealer'}
        </button>
      </div>

    </form>
  </div>
);
};

export default DealerForm;
