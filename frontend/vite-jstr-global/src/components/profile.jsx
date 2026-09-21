// import React from 'react';
// import { 
//   User, Mail, Shield, Calendar, MapPin, 
//   Phone, IdCard, Heart, FileText, CheckCircle, XCircle 
// } from 'lucide-react';

// const UserProfile = () => {
//   // Your MongoDB Data mapped to a clean JavaScript object
//   const user = {
//     idNo: "MKT-0001",
//     name: "SUCCESS Global",
//     email: "jstrgloballimited@gmail.com",
//     role: "admin",
//     gender: "Male",
//     mobileNo: "01914586035",
//     nidNo: "545745641878102",
//     dateOfBirth: "2026-07-10",
//     address: "Dhaka, Bangladesh",
//     district: "Dhaka",
//     thana: "Banani",
//     fatherName: "A",
//     motherName: "B",
//     spouseName: "C",
//     isActive: true,
//     photo: "", // Falls back to a clean dynamic avatar if empty
//     nominee: {
//       name: "A",
//       relation: "B",
//       mobileNo: "01859740567",
//       nidNo: "1234567899",
//       dateOfBirth: "2026-07-10",
//       fatherName: "a",
//       motherName: "a"
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
//       <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        
//         {/* Cover Banner Section */}
//         <div className="h-44 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 relative">
//           <div className="absolute top-6 right-6">
//             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
//               user.isActive 
//                 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
//                 : 'bg-rose-50 text-rose-700 border-rose-200'
//             }`}>
//               {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
//               {user.isActive ? 'Active' : 'Inactive'}
//             </span>
//           </div>
//         </div>

//         {/* Profile Identity Row */}
//         <div className="relative px-8 pb-6 border-b border-slate-100">
//           <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:space-x-6 text-center sm:text-left">
//             <div className="h-32 w-32 bg-slate-100 rounded-2xl border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-slate-400">
//               {user.photo ? (
//                 <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
//               ) : (
//                 <User size={56} className="text-slate-300 stroke-[1.5]" />
//               )}
//             </div>
//             <div className="mt-4 sm:mt-0 flex-1">
//               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
//               <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
//                 <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
//                   <Shield size={14} /> {user.role.toUpperCase()}
//                 </span>
//                 <span className="text-sm font-semibold text-slate-400">ID: {user.idNo}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Grid Content */}
//         <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          
//           {/* Left Column: Personal Information */}
//           <div className="space-y-6">
//             <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
//               <User size={18} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
//             </div>
            
//             <div className="grid grid-cols-1 gap-5">
//               <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
//               <InfoItem icon={<Phone />} label="Phone Number" value={user.mobileNo} />
//               <InfoItem icon={<IdCard />} label="National ID (NID)" value={user.nidNo} />
//               <InfoItem icon={<Calendar />} label="Date of Birth" value={new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
//               <InfoItem icon={<User />} label="Gender" value={user.gender} />
//             </div>

//             {/* Family Metrics Card */}
//             <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-3 mt-4">
//               <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Family Lineage</p>
//               <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
//                 <p><span className="font-medium text-slate-400">Father:</span> <span className="text-slate-800 font-medium">{user.fatherName}</span></p>
//                 <p><span className="font-medium text-slate-400">Mother:</span> <span className="text-slate-800 font-medium">{user.motherName}</span></p>
//                 {user.spouseName && <p><span className="font-medium text-slate-400">Spouse:</span> <span className="text-slate-800 font-medium">{user.spouseName}</span></p>}
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Address & Nominee Info */}
//           <div className="space-y-8">
            
//             {/* Address Details */}
//             <div>
//               <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
//                 <MapPin size={18} className="text-indigo-600" />
//                 <h2 className="text-lg font-bold text-slate-800">Communication Address</h2>
//               </div>
//               <div className="grid grid-cols-1 gap-5">
//                 <InfoItem icon={<MapPin />} label="Street Address" value={user.address} />
//                 <div className="grid grid-cols-2 gap-4">
//                   <InfoItem label="Thana / Sub-District" value={user.thana} />
//                   <InfoItem label="District" value={user.district} />
//                 </div>
//               </div>
//             </div>

//             {/* Nominee Details */}
//             <div>
//               <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
//                 <Heart size={18} className="text-rose-500" />
//                 <h2 className="text-lg font-bold text-slate-800">Nominee Details</h2>
//               </div>
//               <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100/60 space-y-4">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-base">{user.nominee.name}</h3>
//                     <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-1 inline-block">
//                       Relationship: {user.nominee.relation}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 pt-3 border-t border-rose-100/50">
//                   <p className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {user.nominee.mobileNo}</p>
//                   <p className="flex items-center gap-2"><FileText size={13} className="text-slate-400" /> NID: {user.nominee.nidNo}</p>
//                   <p className="text-slate-400 mt-1">Parents: {user.nominee.fatherName} (Father) & {user.nominee.motherName} (Mother)</p>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// // Reusable Clean Info Block Component
// const InfoItem = ({ icon, label, value }) => (
//   <div className="flex items-start space-x-3.5">
//     {icon && <div className="text-slate-400/90 mt-0.5">{React.cloneElement(icon, { size: 16, className: "stroke-[1.75]" })}</div>}
//     <div>
//       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
//       <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || "Not Provided"}</p>
//     </div>
//   </div>
// );

// export default UserProfile;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Shield, Calendar, MapPin, 
  Phone, IdCard, Heart, FileText, CheckCircle, 
  XCircle, Loader2 
} from 'lucide-react';
import API from '../api'; // আপনার তৈরি করা অ্যাক্সিওস/এপিআই ক্লায়েন্ট পাথ
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileByStoredId = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Get the idNo directly from browser localStorage
        const storedIdNo = localStorage.getItem('userIdNo'); 

        // 2. Validate if the idNo exists in storage before hitting the API
        if (!storedIdNo) {
          setError("No user identification ID found in session. Please log in again.");
          setLoading(false);
          return;
        }
        
        // 3. Request profile details using the stored idNo variable
        const response = await API.get(`/users/profile/${storedIdNo}`);
        
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve user profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileByStoredId();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading your profile workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-slate-800">Session Error</h3>
          <p className="mt-2 text-sm text-rose-500 bg-rose-50 px-3 py-1 rounded-md inline-block">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        
        {/* Top Accent Cover */}
        <div className="h-44 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 relative">
          <div className="absolute top-6 right-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm bg-white`}>
              <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {user.isActive ? 'Active Session' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Profile Identity Row */}
        <div className="relative px-8 pb-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:space-x-6 text-center sm:text-left">
            <div className="h-32 w-32 bg-slate-100 rounded-2xl border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
            {user.photo ? (
                // If image path doesn't contain http, prefix it with backend host address
                <img 
                src={user.photo.startsWith('http') ? user.photo : `${SERVER_URL}/${user.photo}`} 
                alt={user.name} 
                className="h-full w-full object-cover" 
                />
            ) : (
                // Beautiful fallback placeholder displaying initials instead of a blank box
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold uppercase">
                {user.name ? user.name.charAt(0) : <User size={40} />}
                </div>
            )}
            </div>
            <div className="mt-4 sm:mt-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md uppercase">
                <Shield size={12} /> {user.role}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Dept: {user.department?.name || 'Global Core'}
                </span>
                <span className="text-sm font-semibold text-slate-400 ml-2">ID: {user.idNo}</span>
            </div>
            </div>
        </div>
        </div>


        {/* Display Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column Fields */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User size={18} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
            </div>

            <div className="space-y-4">
              <InfoRow label="Email Address" value={user.email} icon={<Mail />} />
              <InfoRow label="Mobile Phone" value={user.mobileNo} icon={<Phone />} />
            <InfoRow label="National ID (NID)" value={user.nidNo} icon={<IdCard />} />
              <InfoRow 
                label="Date of Birth" 
                value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not Provided"} 
                icon={<Calendar />} 
              />
              <InfoRow label="Gender" value={user.gender} icon={<User />} />
            </div>

            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-3 mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lineage Relations</p>
              <p className="text-sm text-slate-700"><span className="text-slate-400 font-medium">Father's Name:</span> {user.fatherName || "N/A"}</p>
              <p className="text-sm text-slate-700"><span className="text-slate-400 font-medium">Mother's Name:</span> {user.motherName || "N/A"}</p>
              <p className="text-sm text-slate-700"><span className="text-slate-400 font-medium">Spouse Name:</span> {user.spouseName || "N/A"}</p>
            </div>
          </div>

          {/* Right Column Fields */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
                <MapPin size={18} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">Geographic Address</h2>
              </div>
              <div className="space-y-4">
                <InfoRow label="Street Address Line" value={user.address} icon={<MapPin />} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Thana" value={user.thana} />
                  <InfoRow label="District" value={user.district} />
                </div>
              </div>
            </div>

           {/* Nominee Block Display */}
            {user.nominee && (
            <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <Heart size={18} className="text-rose-500" />
                <h2 className="text-lg font-bold text-slate-800">Declared Nominee</h2>
                </div>
                <div className="bg-rose-50/20 p-5 rounded-2xl border border-rose-100/60 flex items-start gap-4">
                
                {/* Nominee Photo Circle */}
                <div className="h-16 w-16 bg-white border border-rose-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {user.nominee.photo ? (
                    // Replaces backslashes with forward slashes for proper web asset path mapping
                    <img 
                        src={`${SERVER_URL}/${user.nominee.photo.replace(/\\/g, '/')}`} 
                        alt={user.nominee.name} 
                        className="h-full w-full object-cover" 
                    />
                    ) : (
                    <User size={24} className="text-rose-300" />
                    )}
                </div>

                {/* Nominee Text Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base truncate">{user.nominee.name || "N/A"}</h3>
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                    Relation Status: {user.nominee.relation || "N/A"}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 pt-2.5 mt-2 border-t border-rose-100/50">
                    <p className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {user.nominee.mobileNo || "N/A"}</p>
                    <p className="flex items-center gap-2"><FileText size={13} className="text-slate-400" /> Nominee NID: {user.nominee.nidNo || "N/A"}</p>
                    </div>
                </div>

                </div>
            </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

// Internal reusable grid row
const InfoRow = ({ label, value = "", icon }) => (
  <div className="flex items-start space-x-3.5">
    {icon && <div className="text-slate-400 mt-0.5">{React.cloneElement(icon, { size: 16 })}</div>}
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || "Not Provided"}</p>
    </div>
  </div>
);

export default UserProfile;
