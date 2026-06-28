import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar, IdCard, Shield } from 'lucide-react';

const ViewDealer = () => {
    const { id } = useParams(); // URL থেকে ডিলারের আইডি নেওয়ার জন্য (যেমন: /dealers/view/:id)
    const navigate = useNavigate();

    const [dealer, setDealer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ব্যাকএন্ড থেকে নির্দিষ্ট ডিলারের সম্পূর্ণ ডাটা লোড করা
    useEffect(() => {
        const fetchDealerDetails = async () => {
            try {
                // অবশ্যই ব্যাকটিক ( ` ) ব্যবহার করবেন
                const response = await axios.get(`http://localhost:3000/api/dealers/${id}`);
                if (response.data.success) {
                    setDealer(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching dealer details:", err);
                setError(err.response?.data?.message || "Failed to load dealer details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDealerDetails();
    }, [id]);

    if (loading) return <div className="text-center p-10 font-semibold text-gray-600">Loading Dealer Profile...</div>;
    if (error) return <div className="text-center text-red-500 p-10 font-medium">{error}</div>;
    if (!dealer) return <div className="text-center text-gray-500 p-10">No dealer data found.</div>;

    // ইমেজ ইউআরএল ফরম্যাট করার হেল্পার ফাংশন
    const getImageUrl = (path) => {
        if (!path) return "https://placeholder.com";
        // যদি ব্যাকএন্ড অলরেডি ফুল ইউআরএল দেয় তবে সেটি, নাহলে লোকালহোস্ট পাথ জোড়া দেওয়া হবে
        return path.startsWith('http') ? path : `http://localhost:3000/${path}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-0 mt-15 md:p-6 bg-gray-50 min-h-screen">
            {/* হেডার অ্যাকশন বার */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/admin-panel/dealer/all')} 
                        className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dealer Profile</h2>
                        <p className="text-xs text-gray-500 font-mono">ID: {dealer.dealerId || 'N/A'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/admin-panel/dealers/edit/${dealer._id}`)} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium shadow"
                >
                    <Edit size={16} />
                    Edit Profile
                </button>
            </div>

            {/* মেইন গ্রিড লেআউট */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* বাম পাশের কলাম: প্রোফাইল কার্ড (ছবি ও স্ট্যাটাস) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center h-fit">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 mb-4 ring-2 ring-gray-200">
                        <img 
                            src={getImageUrl(dealer.photo)} 
                            alt={dealer.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placeholder.com";
                            }}
                        />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{dealer.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Reference ID: {dealer.referenceIdNo || 'None'}</p>
                    
                    {/* স্ট্যাটাস ব্যাজ */}
                    <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        dealer.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' :
                        dealer.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                        'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                        {dealer.status || 'Pending'}
                    </span>
                </div>

                {/* ডান পাশের কলাম: বিস্তারিত তথ্যের ট্যাব */}
                <div className="md:col-span-2 space-y-6">
                    {/* ইনফরমেশন কার্ড */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <h4 className="text-md font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <User size={18} className="text-blue-500" /> Personal & Contact Details
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Mobile Phone</p>
                                    <p className="font-medium text-gray-800">{dealer.mobilePhoneNo || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-800 break-all">{dealer.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                <IdCard size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">National ID (NID) No</p>
                                    <p className="font-medium text-gray-800">{dealer.nationalIdNo || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    <p className="font-medium text-gray-800">
                                        {dealer.dateOfBirth ? dealer.dateOfBirth.split('T')[0] : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* পিতা ও মাতার নাম */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-3">
                            <div>
                                <p className="text-xs text-gray-500">Father's Name</p>
                                <p className="font-medium text-gray-800">{dealer.fathersName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Mother's Name</p>
                                <p className="font-medium text-gray-800">{dealer.mothersName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* ঠিকানা কার্ড */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <h4 className="text-md font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <MapPin size={18} className="text-green-500" /> Address & Location
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">District</p>
                                <p className="font-medium text-gray-800">{dealer.district || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Thana</p>
                                <p className="font-medium text-gray-800">{dealer.thana || 'N/A'}</p>
                            </div>
                            <div className="sm:col-span-2 border-t pt-2">
                                <p className="text-xs text-gray-500">Full Address</p>
                                <p className="font-medium text-gray-800 mt-1">{dealer.address || 'No address provided.'}</p>
                            </div>
                        </div>
                    </div>

                     {/* ডকুমেন্টস ভিউ কার্ড */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                                <Shield size={18} className="text-purple-500" /> Attached Documents
                            </h4>
                            {/* এনআইডি ছবি দেখার বা ডাউনলোড করার বাটন */}
                            {dealer.nidPhoto && (
                                <a 
                                    href={getImageUrl(dealer.nidPhoto)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-md hover:bg-purple-100 transition font-medium border border-purple-200"
                                >
                                    View Full Screen
                                </a>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-medium text-gray-500">National ID Card Copy</p>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                    {dealer.nationalIdNo || 'No NID Number'}
                                </span>
                            </div>
                            
                            {/* এনআইডি ইমেজ বক্স */}
                            <div className="w-full h-56 rounded-md border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                                <img 
                                    src={getImageUrl(dealer.nidPhoto)} 
                                    alt="NID Document" 
                                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://placeholder.com";
                                    }}
                                />
                                {/* মাউস হোভার করলে জুম আইকন বা নোটিশ দেখাবে */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-xs bg-black/60 px-3 py-1.5 rounded-full font-medium shadow-md">
                                        Click "View Full Screen" to Expand
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    
export default ViewDealer;