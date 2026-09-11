// 1st Version of DealerList.jsx (without server-side pagination and filtering)

// import  { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // সঠিক ইম্পোর্ট (react-এর বদলে axios হবে)
// import { Edit3, Eye, Trash2 } from 'lucide-react';

// const DealerList = () => {
//       const [dealers, setDealers] = useState([]);
//     const [filteredDealers, setFilteredDealers] = useState([]); 
//     const [statusList, setStatusList] = useState([]);          
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     const [searchTerm, setSearchTerm] = useState('');           
//     const [selectedStatus, setSelectedStatus] = useState('');   
    
//     const navigate = useNavigate();
//     const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

//     // ১. ব্যাকএন্ড থেকে ডিলার ডাটা এবং ইউনিক স্ট্যাটাস ফেচ করা
//     useEffect(() => {
//         const fetchDealers = async () => {
//             try {
//                 const response = await axios.get(`${SERVER_URL}/api/dealers`);
//                 if (response.data.success) {
//                     const fetchedData = response.data.data || [];
//                     setDealers(fetchedData);
//                     setFilteredDealers(fetchedData); // ইনিশিয়াল ডাটা সেট

//                     // ইউনিক স্ট্যাটাস লিস্ট এখানেই তৈরি করে নেওয়া হলো (২ নম্বর useEffect বাদ দিয়ে)
//                     const uniqueStatuses = [...new Set(fetchedData.map(dealer => dealer.status).filter(Boolean))];
//                     setStatusList(uniqueStatuses);
//                 }
//             } catch (error) {
//                 console.error('Error fetching dealers:', error);
//                 setError('Failed to load dealers data');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDealers();
//     }, []);

//     // ২. লাইভ ফিল্টারিং লজিক (সার্চ এবং ড্রপডাউন ফিল্টার)
//     useEffect(() => {
//         let tempDealers = [...dealers];

//         // সার্চ টার্ম অনুযায়ী ফিল্টার
//         if (searchTerm.trim() !== '') {
//             const currSearch = searchTerm.toLowerCase();
//             tempDealers = tempDealers.filter((dealer) =>
//                 dealer.name?.toLowerCase().includes(currSearch) ||
//                 dealer.dealerId?.toLowerCase().includes(currSearch) || 
//                 dealer.email?.toLowerCase().includes(currSearch) ||
//                 dealer.district?.toLowerCase().includes(currSearch) ||
//                 dealer.thana?.toLowerCase().includes(currSearch) ||
//                 dealer.mobilePhoneNo?.includes(currSearch)             
//             );
//         }

//         // স্ট্যাটাস ড্রপডাউন অনুযায়ী ফিল্টার
//         if (selectedStatus !== '') {
//             tempDealers = tempDealers.filter((dealer) => dealer.status === selectedStatus);
//         }

//         setFilteredDealers(tempDealers);
//     }, [searchTerm, selectedStatus, dealers]);

//     //৩. ডিলার ডিলিট হ্যান্ডলার (ডেমো ফাংশন)
//     const handleDelete = async (id) => {
//         if(window.confirm("Are you sure you want to delete this dealer?")) {
//             try {
//                 // এখানে আপনার ডিলিট API কল করতে পারেন
//                 await axios.delete(`${SERVER_URL}/api/dealers/${id}`);
//                 setDealers(dealers.filter(dealer => dealer._id !== id));
//             } catch (err) {
//                 console.error("Delete failed:", err);
//             }
//         }
//     };


//   if (loading) return <p>Loading dealers...</p>;
//   if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

//   return (
//     <div className="mt-15 p-0 bg-gray-50 min-h-screen">
//       <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            
//              {/* টেবিল হেডার / শিরোনাম */}
//             <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
//                 <h2 className="text-xl font-bold tracking-wide">All Dealers List ({dealers.length})</h2>
//                 <button 
//                     onClick={() => navigate('/admin-panel/dealer/add')} 
//                     className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
//                     + Add New Dealer
//                 </button>
//             </div>

//              {/* 🔍 সার্চ এবং ফিল্টার সেকশন (রেসপন্সিভ গ্রিড) */}
//             <div className="p-4 bg-gray-100 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {/* সার্চ ইনপুট বক্স */}
//             <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Dealers</label>
//                 <input
//                 type="text"
//                 placeholder="Search by Name, ID or Mobile District & Thana..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//                 />
//             </div>

//             {/* ডিপার্টমেন্ট ড্রপডাউন ফিল্টার */}
//             <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter by Status</label>
//                 <select
//                 value={selectedStatus}
//                 onChange={(e) => setSelectedStatus(e.target.value)}
//                 className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//                 >
//                 <option value="">All Statuses</option>
//                 {statusList.map((status, index) => (
//                         <option key={index} value={status}>{status}</option>
//                     ))}
//                 </select>
//             </div>
//             </div>

//             {/* 📱 রেসপন্সিভ কন্টেইনার (মোবাইল ও ডেক্সটপ হ্যান্ডলার) */}
//             <div>
//                  {/* ১. মোবাইল ভিউ: ছোট স্ক্রিনে (xs, sm, md) এই কার্ডগুলো দেখাবে, ডেক্সটপে (lg) হাইড থাকবে */}
//                 <div className="block lg:hidden divide-y divide-gray-200">
//                     {filteredDealers.map((emp) => (
//                     <div key={emp._id} className="p-4 bg-white hover:bg-gray-50 transition space-y-3">
                        
//                         {/* প্রোফাইল, নাম ও আইডি */}
//                         <div className="flex items-center space-x-3">
                        
//                             <div>
//                                 <div className="font-bold text-gray-900">{emp.name}</div>
//                                 <div className="text-xs text-indigo-600 font-mono">{emp.dealerId}</div>
//                             </div>
//                            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
//                                 emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                             }`}>
//                                 {emp.status === 'Active' ? 'Active' : 'Inactive'}
//                             </span>

//                         </div>

//                         {/* কন্টাক্ট, ডিপার্টমেন্ট ও রোল এর গ্রিড */}
//                         <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
//                         <div>
//                             <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Contact</span>
//                             <div>{emp.mobilePhoneNo}</div>
//                             <div className="text-gray-400 truncate max-w-[150px]">{emp.email}</div>
//                         </div>
//                         <div>
//                             <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">District</span>
//                             <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
//                             {emp.district || 'N/A'}
//                             </span>
//                         </div>
//                         <div className="mt-1">
//                             <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Thana</span>
//                             <span className="capitalize font-medium">{emp.thana || 'N/A'}</span>
//                         </div>
//                         </div>

//                         {/* অ্যাকশন বাটনসমূহ */}
//                         <div className="flex justify-end space-x-3 pt-2 text-sm">
//                         <button 
//                            onClick={() => navigate(`/admin-panel/dealers/view/${emp._id}`)}
//                             className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md">
                        
//                         <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
//                         </button>
//                         {/* ✏️ Lucide Edit3 Icon */}
//                                 <button 
                               
//                                onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
//                                 className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
//                                 >
//                                 <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
//                                 </button>


//                         {/* 🗑️ Lucide Trash2 Icon */}
//                                 <button 
//                                 onClick={() => handleDelete(emp._id)}
//                                 className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
//                                 >
//                                 <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
//                                 </button>
//                         </div>

//                     </div>
//                     ))}
//                 </div>


//                 {/* ২. ডেক্সটপ ভিউ: বড় স্ক্রিনে (lg) টেবিল দেখাবে, মোবাইলে হাইড থাকবে */}
//                 <div className="hidden lg:block overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                     <thead>
//                         <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
//                         <th className="px-6 py-4">ID & Name</th>
//                         <th className="px-6 py-4">Contact & Email</th>
//                         <th className="px-6 py-4">District</th>
//                         <th className="px-6 py-4">Thana</th>
//                         <th className="px-6 py-4">Status</th>
//                         <th className="px-6 py-4 text-center">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
//                         {filteredDealers.map((emp) => (
//                         <tr key={emp._id} className="hover:bg-gray-50 transition duration-150">
                           

//                             <td className="px-6 py-4">
//                             <div className="font-semibold text-gray-900">{emp.name}</div>
//                             <div className="text-xs text-indigo-600 font-mono mt-0.5">{emp.dealerId}</div>
//                             </td>
//                             <td className="px-6 py-4">
//                             <div>{emp.mobilePhoneNo}</div>
//                             <div className="text-xs text-gray-400">{emp.email}</div>
//                             </td>
//                             <td className="px-6 py-4 capitalize font-medium">{emp.district}</td>
//                             <td className="px-6 py-4 capitalize font-medium">{emp.thana}</td>
                
//                             <td className="px-6 py-4">
//                                 <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
//                                     emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                                 }`}>
//                                     {emp.status === 'Active' ? 'Active' : 'Inactive'}
//                                 </span>

//                             </td>
//                             <td className="px-6 py-4 text-center space-x-2">
//                             <button 
//                                 className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md"
//                                onClick={() => navigate(`/admin-panel/dealers/view/${emp._id}`)}
//                             >
//                                 <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
//                             </button>
//                             {/* ✏️ Lucide Edit3 Icon */}
//                                 <button 
                               
//                                onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
//                                 className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
//                                 >
//                                 <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
//                                 </button>


//                         {/* 🗑️ Lucide Trash2 Icon */}
//                                 <button 
//                                onClick={() => handleDelete(emp._id)}
//                                 className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
//                                 >
//                                 <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
//                                 </button>
//                             </td>
//                         </tr>
//                         ))}
//                     </tbody>
//                     </table>
                    
//                 </div>
//             </div>
             
           
//       </div>
//     </div>
//   );
// };

// export default DealerList;


// 2nd Version of DealerList.jsx (with server-side pagination and filtering)
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { Edit3, Eye, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const DealerList = () => {
    const [dealers, setDealers] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [statusList, setStatusList] = useState([]);          
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 📊 সার্ভার-সাইড পেজিনেশন ও ফিল্টারের নতুন স্টেটসমূহ
    const [searchTerm, setSearchTerm] = useState('');           
    const [selectedStatus, setSelectedStatus] = useState('');   
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20); 
    
    const navigate = useNavigate();
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; 

    // ১. ব্যাকএন্ড থেকে ইউনিক স্ট্যাটাস লিস্ট নিয়ে আসা (ড্রপডাউনের জন্য)
    const fetchStatusList = async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/api/dealers/statuses`);
            if (response.data.success) {
                setStatusList(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
            setStatusList(['Active', 'Inactive']); 
        }
    };

    // ২. ব্যাকএন্ড থেকে পেজিনেশন ও কুয়েরি প্যারামিটারসহ ডিলার ডাটা ফেচ করা
    const fetchDealers = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: limit,
                search: searchTerm,
                status: selectedStatus // ফ্রন্টএন্ড থেকে ব্যাকএন্ডে পাঠানো প্যারামিটার
            }).toString();

            const response = await axios.get(`${SERVER_URL}/api/dealers?${queryParams}`);
            if (response.data.success) {
                setDealers(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalCount(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching dealers:', error);
            setError('Failed to load dealers data');
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, searchTerm, selectedStatus, SERVER_URL]);

    // প্রথম Pege লোড হলে স্ট্যাটাস লিস্ট আনা
    useEffect(() => {
        fetchStatusList();
    }, []);

    // পেজ বা স্ট্যাটাস চেঞ্জ হলে ডাটা রিলোড হবে
    useEffect(() => {
        fetchDealers();
    }, [currentPage, selectedStatus, fetchDealers]);

    // লাইভ সার্চ হ্যান্ডলার (টাইপ করার সাথে সাথে ডাটা কুয়েরি হবে)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // সার্চের লেখা চেঞ্জ হলেই পেজ ১ এ যাবে
    };

    // স্ট্যাটাস চেঞ্জ হ্যান্ডলার
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(1); // স্ট্যাটাস চেঞ্জ হলেই পেজ ১ এ যাবে
    };

    // ফর্ম সাবমিট (এন্টার চাপলে পেজ যেন রিলোড না হয়)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchDealers();
    };

    // 🗑️ ডিলার ডিলিট হ্যান্ডলার
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this dealer?")) {
            try {
                await axios.delete(`${SERVER_URL}/api/dealers/${id}`);
                fetchDealers(); 
                alert('সফলভাবে ডিলিট হয়েছে!');
            } catch (err) {
                console.error("Delete failed:", err);
                alert('ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    if (loading && dealers.length === 0) return <p className="p-6 text-center text-lg font-semibold text-gray-700">Loading dealers...</p>;
    if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

    return (
        <div className="mt-15 p-0 bg-gray-50 min-h-screen">
            <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                
                {/* 🏷️ টেবিল হেডার / শিরোনাম */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-wide">All Dealers List ({totalCount})</h2>
                    <button 
                        onClick={() => navigate('/admin-panel/dealer/add')} 
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
                        + Add New Dealer
                    </button>
                </div>

                {/* 🔍 সার্চ এবং ফিল্টার সেকশন */}
                <form onSubmit={handleSearchSubmit} className="p-4 bg-gray-100 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Dealers</label>
                        <input
                            type="text"
                            placeholder="Search by Name, ID, Mobile, District..."
                            value={searchTerm}
                            onChange={handleSearchChange} 
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter by Status</label>
                        <select
                            value={selectedStatus}
                            onChange={handleStatusChange} 
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black"
                        >
                            <option value="">All Statuses</option>
                            {statusList.map((status, index) => (
                                <option key={index} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* <div>
                        <button 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                            <Search className="w-4 h-4" /> Search
                        </button>
                    </div> */}
                </form>

                              {/* 📱 রেসপন্সিভ কন্টেইনার */}
                <div>
                    {/* ১. মোবাইল ভিউ */}
                    <div className="block lg:hidden divide-y divide-gray-200">
                        {dealers.map((emp) => (
                            <div key={emp._id} className="p-4 bg-white hover:bg-gray-50 transition space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="font-bold text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-indigo-600 font-mono">{emp.dealerId}</div>
                                    </div>
                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                                        emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {emp.status === 'Active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* কন্টাক্ট, ডিস্ট্রিক্ট ও থানার গ্রিড */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Contact</span>
                                        <div className="text-gray-900 font-medium">{emp.mobilePhoneNo}</div>
                                        <div className="text-gray-400 truncate max-w-[140px]">{emp.email}</div>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">District</span>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                                            {emp.district || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Thana</span>
                                        <span className="capitalize font-medium text-gray-900">{emp.thana || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* অ্যাকশন বাটনসমূহ */}
                                <div className="flex justify-end space-x-3 pt-2 text-sm border-t border-gray-100">
                                    <button 
                                        onClick={() => navigate(`/admin-panel/dealers/view/${emp._id}`)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium p-1.5 bg-indigo-50 rounded-md transition"
                                    >
                                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
                                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 transition inline-flex items-center gap-1 text-xs font-bold"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(emp._id)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded bg-red-50 hover:bg-red-100 transition inline-flex items-center gap-1 text-xs font-bold"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ২. ডেক্সটপ ভিউ */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
                                    <th className="px-6 py-4">ID & Name</th>
                                    <th className="px-6 py-4">Contact & Email</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Thana</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
                                {dealers.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-indigo-600 font-mono mt-0.5">{emp.dealerId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{emp.mobilePhoneNo}</div>
                                            <div className="text-xs text-gray-400">{emp.email}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize font-medium">{emp.district}</td>
                                        <td className="px-6 py-4 capitalize font-medium">{emp.thana}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {emp.status === 'Active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button 
                                                className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md"
                                                onClick={() => navigate(`/admin-panel/dealers/view/${emp._id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 transition inline-flex items-center gap-1 text-xs font-bold"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(emp._id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 rounded bg-red-50 hover:bg-red-100 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 📊 পেজিনেশন প্যানেল */}
                               {/* 📊 পেজিনেশন প্যানেল */}
                {dealers.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">
                            Showing Page <span className="text-indigo-600 font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> ({totalCount} total dealers)
                        </span>
                        <div className="flex items-center space-x-2">
                            <button 
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                if (pageNum === 1 || pageNum === totalPages || Math.abs(currentPage - pageNum) <= 1) {
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition shadow-sm border ${
                                                currentPage === pageNum 
                                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (pageNum === 2 || pageNum === totalPages - 1) {
                                    return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                }
                                return null;
                            })}

                            <button 
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {dealers.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400 font-medium bg-white">
                        No dealers found in the database.
                    </div>
                )}
                 
            </div>
        </div>
    );
};

export default DealerList;
