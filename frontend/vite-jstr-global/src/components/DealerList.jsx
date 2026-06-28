import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // সঠিক ইম্পোর্ট (react-এর বদলে axios হবে)
import { Edit3, Eye, Trash2 } from 'lucide-react';

const DealerList = () => {
      const [dealers, setDealers] = useState([]);
    const [filteredDealers, setFilteredDealers] = useState([]); 
    const [statusList, setStatusList] = useState([]);          
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');           
    const [selectedStatus, setSelectedStatus] = useState('');   
    
    const navigate = useNavigate();

    // ১. ব্যাকএন্ড থেকে ডিলার ডাটা এবং ইউনিক স্ট্যাটাস ফেচ করা
    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/dealers');
                if (response.data.success) {
                    const fetchedData = response.data.data || [];
                    setDealers(fetchedData);
                    setFilteredDealers(fetchedData); // ইনিশিয়াল ডাটা সেট

                    // ইউনিক স্ট্যাটাস লিস্ট এখানেই তৈরি করে নেওয়া হলো (২ নম্বর useEffect বাদ দিয়ে)
                    const uniqueStatuses = [...new Set(fetchedData.map(dealer => dealer.status).filter(Boolean))];
                    setStatusList(uniqueStatuses);
                }
            } catch (error) {
                console.error('Error fetching dealers:', error);
                setError('Failed to load dealers data');
            } finally {
                setLoading(false);
            }
        };

        fetchDealers();
    }, []);

    // ২. লাইভ ফিল্টারিং লজিক (সার্চ এবং ড্রপডাউন ফিল্টার)
    useEffect(() => {
        let tempDealers = [...dealers];

        // সার্চ টার্ম অনুযায়ী ফিল্টার
        if (searchTerm.trim() !== '') {
            const currSearch = searchTerm.toLowerCase();
            tempDealers = tempDealers.filter((dealer) =>
                dealer.name?.toLowerCase().includes(currSearch) ||
                dealer.dealerId?.toLowerCase().includes(currSearch) || 
                dealer.email?.toLowerCase().includes(currSearch) ||
                dealer.district?.toLowerCase().includes(currSearch) ||
                dealer.thana?.toLowerCase().includes(currSearch) ||
                dealer.mobilePhoneNo?.includes(currSearch)             
            );
        }

        // স্ট্যাটাস ড্রপডাউন অনুযায়ী ফিল্টার
        if (selectedStatus !== '') {
            tempDealers = tempDealers.filter((dealer) => dealer.status === selectedStatus);
        }

        setFilteredDealers(tempDealers);
    }, [searchTerm, selectedStatus, dealers]);

    //৩. ডিলার ডিলিট হ্যান্ডলার (ডেমো ফাংশন)
    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this dealer?")) {
            try {
                // এখানে আপনার ডিলিট API কল করতে পারেন
                await axios.delete(`http://localhost:3000/api/dealers/${id}`);
                setDealers(dealers.filter(dealer => dealer._id !== id));
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };


  if (loading) return <p>Loading dealers...</p>;
  if (error) return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;

  return (
    <div className="mt-15 p-0 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            
             {/* টেবিল হেডার / শিরোনাম */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-wide">All Dealers List ({dealers.length})</h2>
                <button 
                    onClick={() => navigate('/admin-panel/dealer/add')} 
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
                    + Add New Dealer
                </button>
            </div>

             {/* 🔍 সার্চ এবং ফিল্টার সেকশন (রেসপন্সিভ গ্রিড) */}
            <div className="p-4 bg-gray-100 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* সার্চ ইনপুট বক্স */}
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Dealers</label>
                <input
                type="text"
                placeholder="Search by Name, ID or Mobile District & Thana..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
            </div>

            {/* ডিপার্টমেন্ট ড্রপডাউন ফিল্টার */}
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filter by Status</label>
                <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                <option value="">All Statuses</option>
                {statusList.map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            </div>

            {/* 📱 রেসপন্সিভ কন্টেইনার (মোবাইল ও ডেক্সটপ হ্যান্ডলার) */}
            <div>
                 {/* ১. মোবাইল ভিউ: ছোট স্ক্রিনে (xs, sm, md) এই কার্ডগুলো দেখাবে, ডেক্সটপে (lg) হাইড থাকবে */}
                <div className="block lg:hidden divide-y divide-gray-200">
                    {filteredDealers.map((emp) => (
                    <div key={emp._id} className="p-4 bg-white hover:bg-gray-50 transition space-y-3">
                        
                        {/* প্রোফাইল, নাম ও আইডি */}
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

                        {/* কন্টাক্ট, ডিপার্টমেন্ট ও রোল এর গ্রিড */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                        <div>
                            <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Contact</span>
                            <div>{emp.mobilePhoneNo}</div>
                            <div className="text-gray-400 truncate max-w-[150px]">{emp.email}</div>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">District</span>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                            {emp.district || 'N/A'}
                            </span>
                        </div>
                        <div className="mt-1">
                            <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[10px]">Thana</span>
                            <span className="capitalize font-medium">{emp.thana || 'N/A'}</span>
                        </div>
                        </div>

                        {/* অ্যাকশন বাটনসমূহ */}
                        <div className="flex justify-end space-x-3 pt-2 text-sm">
                        <button 
                           onClick={() => navigate(`/admin-panel/dealers/view/${emp._id}`)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-1 bg-indigo-50 rounded-md">
                        
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> 
                        </button>
                        {/* ✏️ Lucide Edit3 Icon */}
                                <button 
                               
                               onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
                                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
                                >
                                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                                </button>


                        {/* 🗑️ Lucide Trash2 Icon */}
                                <button 
                                onClick={() => handleDelete(emp._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
                                >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Delete
                                </button>
                        </div>

                    </div>
                    ))}
                </div>


                {/* ২. ডেক্সটপ ভিউ: বড় স্ক্রিনে (lg) টেবিল দেখাবে, মোবাইলে হাইড থাকবে */}
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
                        {filteredDealers.map((emp) => (
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
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
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
                            {/* ✏️ Lucide Edit3 Icon */}
                                <button 
                               
                               onClick={() => navigate(`/admin-panel/dealers/edit/${emp._id}`)}
                                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition inline-flex items-center gap-1 text-xs font-bold"
                                >
                                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> Edit
                                </button>


                        {/* 🗑️ Lucide Trash2 Icon */}
                                <button 
                               onClick={() => handleDelete(emp._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-bold ml-2"
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
             
           
      </div>
    </div>
  );
};

export default DealerList;
