import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, MapPin, ShieldCheck, Phone, Mail, IdCard } from 'lucide-react';

const ViewEmployee = () => {
  const { id } = useParams(); // URL থেকে কর্মচারীর ID নেওয়ার জন্য
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        if (result.success) {
          setEmployee(result.data);
        } else {
          setError(result.message || 'Failed to fetch employee details');
        }
      } catch (err) {
        setError('❌ Server Connection Error!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-lg font-semibold">Loading Profile...</div>;
  if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;
  if (!employee) return <div className="p-6 text-center text-gray-500">No employee data found.</div>;

  // ব্যাকএন্ড থেকে আসা ছবিগুলোর পাথ (আপনার সার্ভারের আপলোড ফোল্ডারের সাথে মিলিয়ে নেবেন)
  const employeePhotoUrl = employee.photo ? `http://localhost:3000/${employee.photo}` : null;
  const nomineePhotoUrl = employee.nominee?.photo ? `http://localhost:3000/${employee.nominee.photo}` : null;

  return (
    <div className="mt-15 p-6 bg-gray-50 min-h-screen space-y-6">
      
      {/* ⬅️ ব্যাক বাটন এবং হেডার */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button 
          onClick={() => navigate('/admin-panel/employees/all')} 
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Employee Profile</h2>
          <p className="text-xs text-gray-500">ID: {employee.idNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 👤 প্রোফাইল কার্ড (বাম পাশের সেকশন) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-50 overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
            {employeePhotoUrl ? (
              <img src={employeePhotoUrl} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2.5 py-1 rounded-full mt-1 inline-block">
              {employee.role}
            </p>
          </div>
          
          <div className="w-full pt-4 border-t border-gray-100 text-left space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{employee.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{employee.mobileNo}</span></div>
          </div>
        </div>

        {/* 📊 বিস্তারিত তথ্যের কার্ড (ডান পাশের সেকশন) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* অফিশিয়াল তথ্য */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Official Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Department</span> <span className="font-medium text-gray-800">{typeof employee.department === 'object' ? employee.department?.name : employee.department || 'N/A'}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Reference ID</span> <span className="font-medium text-gray-800">{employee.refIdNo || 'N/A'}</span></div>
            </div>
          </div>

          {/* ব্যক্তিগত তথ্য */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Identifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-400 block text-xs uppercase font-bold">National ID (NID)</span> <span className="font-medium text-gray-800">{employee.nidNo}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Date of Birth</span> <span className="font-medium text-gray-800">{employee.dateOfBirth}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Gender</span> <span className="font-medium text-gray-800">{employee.gender}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Father's Name</span> <span className="font-medium text-gray-800">{employee.fatherName}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Mother's Name</span> <span className="font-medium text-gray-800">{employee.motherName}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Spouse Name</span> <span className="font-medium text-gray-800">{employee.spouseName || 'N/A'}</span></div>
            </div>
          </div>

          {/* ঠিকানা */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-400 block text-xs uppercase font-bold">District</span> <span className="font-medium text-gray-800">{employee.district}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase font-bold">Thana</span> <span className="font-medium text-gray-800">{employee.thana}</span></div>
              <div className="sm:col-span-1"><span className="text-gray-400 block text-xs uppercase font-bold">Street Address</span> <span className="font-medium text-gray-800">{employee.address}</span></div>
            </div>
          </div>

          {/* 🛡️ নমিনি সেকশন */}
          {employee.nominee && (
            <div className="bg-emerald-50/30 p-6 rounded-xl shadow-md border border-emerald-100 space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Legal Nominee Dependencies
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-24 h-24 rounded-xl border border-emerald-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  {nomineePhotoUrl ? (
                    <img src={nomineePhotoUrl} alt="Nominee" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-emerald-300" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm w-full">
                  <div><span className="text-gray-400 block text-xs uppercase font-bold">Nominee Name</span> <span className="font-medium text-gray-800">{employee.nominee.name}</span></div>
                  <div><span className="text-gray-400 block text-xs uppercase font-bold">Relation</span> <span className="font-medium text-gray-800">{employee.nominee.relation}</span></div>
                  <div><span className="text-gray-400 block text-xs uppercase font-bold">Contact No</span> <span className="font-medium text-gray-800">{employee.nominee.mobileNo}</span></div>
                  <div><span className="text-gray-400 block text-xs uppercase font-bold">Nominee NID</span> <span className="font-medium text-gray-800">{employee.nominee.nidNo || 'N/A'}</span></div>
                  <div><span className="text-gray-400 block text-xs uppercase font-bold">Date of Birth</span> <span className="font-medium text-gray-800">{employee.nominee.dateOfBirth || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
