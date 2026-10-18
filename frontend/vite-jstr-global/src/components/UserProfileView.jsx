// import { useState, useEffect } from 'react';

// export default function UserProfileView() {
//   // 1. Core State Management
//   const [userList, setUserList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
  
//   // 2. Search & Rank Filtering States
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedRank, setSelectedRank] = useState('ALL');

//   // 💡 3. Pagination States (50 Users per page limit)
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const limit = 50; 

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//   // 💡 4. Fetch Paginated Live Data from Server Endpoint
//   useEffect(() => {
//     const fetchPaginatedUsers = async () => {
//       setIsLoading(true);
//       try {
//         // Appending page and limit parameters safely onto the network query chain
//         const response = await fetch(
//           `${SERVER_URL}/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&rank=${selectedRank}`
//         );
//         const result = await response.json();
        
//         if (result.success && result.data) {
//           setUserList(result.data);
//           setTotalPages(result.pagination?.totalPages || 1);
//           setTotalUsers(result.pagination?.totalUsers || result.data.length);
//         } else if (result.data) {
//           setUserList(result.data);
//         }
//       } catch (error) {
//         console.error("Pagination payload extraction failure:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Debouncing the query changes slightly to limit duplicate operations
//     const delayDebounce = setTimeout(() => {
//       fetchPaginatedUsers();
//     }, 300);

//     return () => clearTimeout(delayDebounce);
//   }, [currentPage, searchQuery, selectedRank, SERVER_URL]);

//   // Reset to first page automatically if filters or search criteria change
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleRankChange = (e) => {
//     setSelectedRank(e.target.value);
//     setCurrentPage(1);
//   };

//   // Safe Image URL execution parser
//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return '';
//     return `${SERVER_URL}/${photoPath.replace(/\\/g, '/')}`;
//   };

//   // Extract unique ranks for layout controls (Uses cached data state array safely)
//   const availableRanks = ['All Tiers', 'BOM', 'ED', 'NSM', 'DSM', 'RSM', 'AM'];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
//       <div>
//         {/* Header Block & Mode Selectors */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Corporate Roster Directory</h2>
//             <p className="text-sm text-gray-500 mt-1">Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers} Active Profiles</p>
//           </div>
          
//           <div className="flex items-center bg-gray-200 p-1 rounded-xl shadow-inner">
//             <button
//               onClick={() => setViewMode('grid')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
//                 viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               🎴 Card Grid
//             </button>
//             <button
//               onClick={() => setViewMode('table')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
//                 viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               📋 Data Table
//             </button>
//           </div>
//         </div>

//         {/* Dynamic Lookup Filters */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
//           <div className="flex-1 relative">
//             <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
//             <input
//               type="text"
//               placeholder="Filter list in real-time..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//             />
//           </div>
          
//           <div className="w-full sm:w-48">
//             <select
//               value={selectedRank}
//               onChange={handleRankChange}
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-gray-700"
//             >
//               {availableRanks.map(rank => (
//                 <option key={rank} value={rank}>{rank === 'ALL' ? 'All Tiers' : rank}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Loading Indicator Wheel */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-24 text-gray-500 font-medium text-sm gap-2">
//             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <span>Loading optimized registry batch...</span>
//           </div>
//         )}

//         {/* Empty Roster Fallback state */}
//         {!isLoading && userList.length === 0 && (
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2 shadow-sm">
//             <span className="text-3xl">🚫</span>
//             <span>No employee entries match your selection range.</span>
//           </div>
//         )}

//         {/* 1. Grid Card View Mode Configuration Layer */}
//         {!isLoading && viewMode === 'grid' && userList.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {userList.map((user) => (
//               <div key={user._id?.$oid || user._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between">
//                 <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                 }`}>
//                   {user.isActive ? '● Active' : '○ Inactive'}
//                 </span>

//                 <div className="p-5 flex flex-col items-center text-center">
//                   <img
//                     src={getImageUrl(user.photo)}
//                     alt={user.name}
//                     className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/10 shadow-sm mb-4"
//                     onError={(e) => { e.target.src = ''; }}
//                   />
//                   <h3 className="text-base font-bold text-gray-900 tracking-tight">{user.name}</h3>
//                   <div className="flex items-center gap-1.5 mt-1">
//                     <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-md uppercase tracking-wider">{user.rank || 'N/A'}</span>
//                     <span className="text-xs font-medium text-gray-400">|</span>
//                     <span className="text-xs text-gray-500 font-mono font-semibold">{user.idNo || 'N/A'}</span>
//                   </div>

//                   <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📞</span><span className="font-medium tracking-wide">{user.mobileNo || 'N/A'}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">✉️</span><span className="truncate max-w-[180px]">{user.email}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📍</span><span className="truncate max-w-[180px]">{user.address || 'N/A'}</span></div>
//                   </div>
//                 </div>

//                 <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
//                   <span className="text-gray-400 capitalize font-medium">Role: {user.role || 'User'}</span>
//                   <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View Profile →</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* 2. Corporate Data Table View Mode Configuration Layer */}
//         {!isLoading && viewMode === 'table' && userList.length > 0 && (
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse whitespace-nowrap">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
//                     <th className="p-4 text-center w-12">Photo</th>
//                     <th className="p-4">Employee Details</th>
//                     <th className="p-4">ID Number</th>
//                     <th className="p-4">Rank / Tier</th>
//                     <th className="p-4">Contact Info</th>
//                     <th className="p-4">Location</th>
//                     <th className="p-4 text-center">Status</th>
//                     <th className="p-4 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {userList.map((user) => (
//                     <tr key={user._id?.$oid || user._id} className="hover:bg-gray-50/70 transition-colors">
//                       {/* Photo Column with Slash Safety */}
//                       <td className="p-4 text-center">
//                         <img
//                           src={getImageUrl(user.photo)}
//                           alt={user.name}
//                           className="w-10 h-10 rounded-xl object-cover mx-auto border border-gray-200 shadow-sm"
//                           onError={(e) => { e.target.src = ''; }}
//                         />
//                       </td>

//                       {/* Name and Email Details */}
//                       <td className="p-4">
//                         <div className="font-bold text-gray-900">{user.name}</div>
//                         <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
//                       </td>

//                       {/* Unique Employee ID (MKT-0002) */}
//                       <td className="p-4 font-mono font-semibold text-xs text-gray-600">
//                         {user.idNo || 'N/A'}
//                       </td>

//                       {/* Corporate Designation Tier (DSM) */}
//                       <td className="p-4">
//                         <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-md uppercase tracking-wider">
//                           {user.rank || 'N/A'}
//                         </span>
//                       </td>

//                       {/* Dynamic Contact Metrics */}
//                       <td className="p-4 font-medium tracking-wide text-xs">
//                         {user.mobileNo || 'N/A'}
//                       </td>

//                       {/* Roster Physical Address Segment */}
//                       <td className="p-4">
//                         <div className="text-xs font-medium text-gray-900">{user.address || 'N/A'}</div>
//                         {user.district && <div className="text-[10px] text-gray-400 mt-0.5">{user.district}</div>}
//                       </td>

//                       {/* Activity Lifecycle Status Indicator */}
//                       <td className="p-4 text-center">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
//                           user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                         }`}>
//                           {user.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>

//                       {/* Control Panel Action Button */}
//                       <td className="p-4 text-center">
//                         <button className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">
//                           Manage
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* //* =========================================================================
//           ⚙️ 5. Pagination Control Footer Grid
//           ========================================================================= */}
//       {!isLoading && totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 bg-white p-4 rounded-2xl shadow-sm border">
//           <span className="text-xs font-medium text-gray-500">
//             Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong>
//           </span>
          
//           <div className="flex items-center gap-2">
//             {/* Previous Control Hook */}
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-250 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               ◀ Previous
//             </button>
            
//             {/* Numeric Direct Step Nav Mapping */}
//             {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
//               <button
//                 key={pageNum}
//                 onClick={() => setCurrentPage(pageNum)}
//                 className={`w-9 h-9 text-xs font-bold rounded-xl transition-all shadow-sm border ${
//                   currentPage === pageNum 
//                     ? 'bg-blue-600 text-white border-blue-600' 
//                     : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
//                 }`}
//               >
//                 {pageNum}
//               </button>
//             ))}

//             {/* Next Control Hook */}
//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-250 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               Next ▶
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';

// export default function UserProfileView() {
//   // ১. কোর স্টেট ম্যানেজমেন্ট
//   const [userList, setUserList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
  
//   // ২. সার্চ ও ডাইনামিক কর্পোরেট ফিল্টারিং স্টেট
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedTeam, setSelectedTeam] = useState('ALL');

//   // ৩. সার্ভার সাইড পেজিনেশন স্টেট
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const limit = 50; 

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//   // 💡 ৪. সার্ভার থেকে পেজ ও ডাইনামিক টিম ফিল্টার অনুযায়ী ডাটা তুলে আনা
//   useEffect(() => {
//     const fetchPaginatedUsers = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(
//           `${SERVER_URL}/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&team=${selectedTeam}`
//         );
//         const result = await response.json();
        
//         if (result.success && result.data) {
//           setUserList(result.data);
//           setTotalPages(result.pagination?.totalPages || 1);
//           setTotalUsers(result.pagination?.totalUsers || result.data.length);
//         } else if (Array.isArray(result)) {
//           setUserList(result);
//         }
//       } catch (error) {
//         console.error("User roster loading failed:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const delayDebounce = setTimeout(() => {
//       fetchPaginatedUsers();
//     }, 400);

//     return () => clearTimeout(delayDebounce);
//   }, [currentPage, searchQuery, selectedTeam, SERVER_URL]);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleTeamChange = (teamValue) => {
//     setSelectedTeam(teamValue);
//     setCurrentPage(1);
//   };

//   // ৫. ছবির উইন্ডোজ পাথ ব্যাকস্ল্যাশ ফিক্স করার মেথড
//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return '';
//     const cleanPath = photoPath.replace(/\\/g, '/');
//     return `${SERVER_URL}/${cleanPath}`;
//   };

//   // 💡 র‍্যাংক ও টিমের ভিত্তিতে ডাইনামিক কালার কোডিং ব্যাজ
//   const getRankBadgeStyles = (rank) => {
//     const r = rank?.toUpperCase() || '';
//     if (r === 'EX DIR' || r === 'NSM') return 'bg-purple-50 text-purple-700 border-purple-200';
//     if (r === 'BOM' || r === 'DSM') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
//     if (r === 'ADMIN') return 'bg-red-50 text-red-700 border-red-200';
//     if (r === 'MANAGER') return 'bg-amber-50 text-amber-700 border-amber-200';
//     return 'bg-gray-50 text-gray-700 border-gray-200';
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
//       <div>
//         {/* =========================================================================
//             কর্পোরেট হেডার ও ভিউ কন্ট্রোলার
//             ========================================================================= */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Corporate Portfolio</h2>
//             <p className="text-sm text-gray-500 mt-1">
//               Showing {userList.length > 0 ? (currentPage - 1) * limit + 1 : 0}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers} Active Corporate Profiles
//             </p>
//           </div>
          
//           <div className="flex items-center bg-gray-200 p-1 rounded-xl shadow-inner">
//             <button
//               onClick={() => setViewMode('grid')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
//                 viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               🎴 Card Grid
//             </button>
//             <button
//               onClick={() => setViewMode('table')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
//                 viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               📋 Data Table
//             </button>
//           </div>
//         </div>

//         {/* =========================================================================
//             🏢 ক্যাটাগরি টিম ফিল্টার ট্যাব (Corporate / Marketing Switcher)
//             ========================================================================= */}
//         <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
//           <button
//             onClick={() => handleTeamChange('ALL')}
//             className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
//               selectedTeam === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
//             }`}
//           >
//             🌎 All Roster
//           </button>
//           <button
//             onClick={() => handleTeamChange('CORPORATE')}
//             className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
//               selectedTeam === 'CORPORATE' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
//             }`}
//           >
//             🏢 Corporate (Admin / Managers)
//           </button>
//           <button
//             onClick={() => handleTeamChange('MARKETING')}
//             className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
//               selectedTeam === 'MARKETING' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
//             }`}
//           >
//             🚀 Marketing Team (BOM / Ex Dir / NSM / DSM)
//           </button>
//         </div>

//         {/* সার্চ বার ইনপুট */}
//         <div className="w-full mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
//           <div className="relative">
//             <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
//             <input
//               type="text"
//               placeholder="Search by executive name, unique idNo, or contact phone..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//             />
//           </div>
//         </div>

//         {/* লোডিং ইন্ডিকেটর */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-24 text-gray-500 font-medium text-sm gap-2">
//             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <span>Loading optimized registry batch...</span>
//           </div>
//         )}

//         {/* ফাঁকা স্টেট */}
//         {!isLoading && userList.length === 0 && (
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2 shadow-sm">
//             <span className="text-3xl">🚫</span>
//             <span>No operational entries match your dynamic criteria.</span>
//           </div>
//         )}

//         {/* =========================================================================
//             💡 ১. গ্রিড কার্ড লেআউট (Grid Card Layout)
//             ========================================================================= */}
//         {!isLoading && viewMode === 'grid' && userList.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {userList.map((user) => (
//               <div 
//                 key={user._id?.$oid || user._id} 
//                 className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between"
//               >
//                 {/* অ্যাক্টিভ লাইফসাইকেল স্ট্যাটাস */}
//                 <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
//                   user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                 }`}>
//                   {user.isActive ? '● Active' : '○ Inactive'}
//                 </span>

//                 <div className="p-5 flex flex-col items-center text-center">
//                   <img
//                     src={getImageUrl(user.photo)}
//                     alt={user.name}
//                     className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm mb-4 bg-gray-50"
//                     onError={(e) => { e.target.src = ''; }}
//                   />
//                   <h3 className="text-base font-bold text-gray-900 tracking-tight">{user.name}</h3>
                  
//                                   {/* ডাইনামিক কর্পোরেট র‍্যাংক ব্যাজ */}
//                   <div className="flex items-center gap-1.5 mt-1">
//                     <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${getRankBadgeStyles(user.rank)}`}>
//                       {user.rank || 'Staff'}
//                     </span>
//                     <span className="text-xs font-medium text-gray-300">|</span>
//                     <span className="text-xs text-gray-500 font-mono font-semibold">{user.idNo || 'N/A'}</span>
//                   </div>

//                   <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📞</span><span className="font-medium tracking-wide">{user.mobileNo || 'N/A'}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">✉️</span><span className="truncate max-w-[180px]">{user.email}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📍</span><span className="truncate max-w-[180px]">{user.address || 'N/A'}</span></div>
//                   </div>
//                 </div>

//                 <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
//                   <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Role: {user.role || 'User'}</span>
//                   <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View Profile →</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* =========================================================================
//             💡 ২. ডাটাসেন্ট্রিক টেবিল লেআউট (Corporate Data Table Layout)
//             ========================================================================= */}
//         {!isLoading && viewMode === 'table' && userList.length > 0 && (
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse whitespace-nowrap">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
//                     <th className="p-4 text-center w-12">Photo</th>
//                     <th className="p-4">Employee Details</th>
//                     <th className="p-4">ID Number</th>
//                     <th className="p-4">Rank / Designation</th>
//                     <th className="p-4">Contact Info</th>
//                     <th className="p-4">Location</th>
//                     <th className="p-4 text-center">Status</th>
//                     <th className="p-4 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {userList.map((user) => (
//                     <tr key={user._id?.$oid || user._id} className="hover:bg-gray-50/70 transition-colors">
//                       <td className="p-4 text-center">
//                         <img
//                           src={getImageUrl(user.photo)}
//                           alt={user.name}
//                           className="w-10 h-10 rounded-xl object-cover mx-auto border border-gray-200 shadow-sm"
//                           onError={(e) => { e.target.src = ''; }}
//                         />
//                       </td>
//                       <td className="p-4">
//                         <div className="font-bold text-gray-900">{user.name}</div>
//                         <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
//                       </td>
//                       <td className="p-4 font-mono font-semibold text-xs text-gray-600">{user.idNo || 'N/A'}</td>
//                       <td className="p-4">
//                         <span className={`px-2.5 py-1 border text-xs font-extrabold rounded-md uppercase tracking-wider ${getRankBadgeStyles(user.rank)}`}>
//                           {user.rank || 'Staff'}
//                         </span>
//                       </td>
//                       <td className="p-4 font-medium tracking-wide text-xs">{user.mobileNo || 'N/A'}</td>
//                       <td className="p-4">
//                         <div className="text-xs font-medium text-gray-900">{user.address || 'N/A'}</div>
//                         {user.district && <div className="text-[10px] text-gray-400 mt-0.5">{user.district}</div>}
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
//                           user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                         }`}>
//                           {user.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       <td className="p-4 text-center">
//                         <button className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">Manage</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* =========================================================================
//           ⚙️ ৫. পেজিনেশন কন্ট্রোল ফুটার 
//           ========================================================================= */}
//       {!isLoading && totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 bg-white p-4 rounded-2xl shadow-sm border">
//           <span className="text-xs font-medium text-gray-500">
//             Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong>
//           </span>
          
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               ◀ Previous
//             </button>
            
//             {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
//               <button
//                 key={pageNum}
//                 onClick={() => setCurrentPage(pageNum)}
//                 className={`w-9 h-9 text-xs font-bold rounded-xl transition-all shadow-sm border ${
//                   currentPage === pageNum 
//                     ? 'bg-blue-600 text-white border-blue-600' 
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 {pageNum}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               Next ▶
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';

// // 💡 currentUser প্রপস পাস করতে হবে (যেমন: { role: 'client' } বা { role: 'admin' })
// export default function UserProfileView({ currentUser = { role: 'client' } }) {
//   // ইউজার এডমিন কিনা তা শুরুতেই চেক করা হলো
//   const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

//   // ১. কোর স্টেট ম্যানেজমেন্ট
//   const [userList, setUserList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // 💡 সিকিউরিটি ফিক্স: ইউজার ক্লায়েন্ট হলে সরাসরি MARKETING ওপেন হবে, এডমিন হলে ALL ওপেন হবে
//   const [selectedTeam, setSelectedTeam] = useState(isAdmin ? 'ALL' : 'MARKETING');

//   // ২. পেজিনেশন স্টেট (প্রতি পেজে ৫০ জন)
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const limit = 50; 

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//   // 💡 ৩. এপিআই থেকে পেজ ও ডাইনামিক রোল ফিল্টার অনুযায়ী ডাটা তুলে আনা
//   useEffect(() => {
//     const fetchPaginatedUsers = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(
//           `${SERVER_URL}/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&team=${selectedTeam}`
//         );
//         const result = await response.json();
        
//         if (result.success && result.data) {
//           setUserList(result.data);
//           setTotalPages(result.pagination?.totalPages || 1);
//           setTotalUsers(result.pagination?.totalUsers || result.data.length);
//         } else if (Array.isArray(result)) {
//           setUserList(result);
//         }
//       } catch (error) {
//         console.error("Roster data load করতে সমস্যা হয়েছে:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const delayDebounce = setTimeout(() => {
//       fetchPaginatedUsers();
//     }, 400);

//     return () => clearTimeout(delayDebounce);
//   }, [currentPage, searchQuery, selectedTeam, SERVER_URL]);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleTeamChange = (teamValue) => {
//     // ক্লায়েন্ট বা অন্য কেউ জোরপূর্বক স্টেট চেঞ্জ করতে চাইলে তা ব্লক করে দেবে
//     if (!isAdmin && teamValue !== 'MARKETING') return;
//     setSelectedTeam(teamValue);
//     setCurrentPage(1);
//   };

//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return '';
//     return `${SERVER_URL}/${photoPath.replace(/\\/g, '/')}`;
//   };

//   const getRankBadgeStyles = (rank) => {
//     const r = rank?.toUpperCase() || '';
//     if (r === 'EX DIR' || r === 'NSM') return 'bg-purple-50 text-purple-700 border-purple-200';
//     if (r === 'BOM' || r === 'DSM') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
//     if (r === 'ADMIN') return 'bg-red-50 text-red-700 border-red-200';
//     if (r === 'MANAGER') return 'bg-amber-50 text-amber-700 border-amber-200';
//     return 'bg-gray-50 text-gray-700 border-gray-200';
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
//       <div>
//         {/* হেডার এরিয়া */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Portfolio Roster</h2>
//             <p className="text-sm text-gray-500 mt-1">
//               Showing {userList.length > 0 ? (currentPage - 1) * limit + 1 : 0}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers} Active Roster Entries
//             </p>
//           </div>
          
//           <div className="flex items-center bg-gray-200 p-1 rounded-xl shadow-inner">
//             <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>🎴 Card Grid</button>
//             <button onClick={() => setViewMode('table')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>📋 Data Table</button>
//           </div>
//         </div>

//         {/* =========================================================================
//             🏢 ক্যাটাগরি টিম ফিল্টার ট্যাব (এডমিন বনাম ক্লায়েন্ট কন্ডিশনাল রেন্ডারিং)
//             ========================================================================= */}
//         <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
//           {/* 💡 লগইন করা ইউজার এডমিন হলে সব ট্যাব দেখতে পাবেন */}
//           {isAdmin ? (
//             <>
//               <button
//                 onClick={() => handleTeamChange('ALL')}
//                 className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
//               >
//                 🌎 All Roster
//               </button>
//               <button
//                 onClick={() => handleTeamChange('CORPORATE')}
//                 className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'CORPORATE' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
//               >
//                 🏢 Corporate (Admin / Managers)
//               </button>
//               <button
//                 onClick={() => handleTeamChange('MARKETING')}
//                 className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'MARKETING' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
//               >
//                 🚀 Marketing Team (BOM / Ex Dir / NSM / DSM)
//               </button>
//             </>
//           ) : (
//             // 💡 ইউজার ক্লায়েন্ট হলে কোনো বাটন থাকবে না, শুধু একটি সুন্দর টেক্সট ব্যানার দেখাবে
//             <div className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
//               🚀 Marketing Strategy Portfolio (BOM / Ex Dir / NSM / DSM)
//             </div>
//           )}
//         </div>

//         {/* সার্চ বার ইনপুট */}
//         <div className="w-full mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
//           <div className="relative">
//             <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
//             <input type="text" placeholder="Search roster details..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
//           </div>
//         </div>

//         {/* লোডিং ও ফাঁকা স্টেট হ্যান্ডলার */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-24 text-gray-500 font-medium text-sm gap-2">
//             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <span>Loading optimized registry batch...</span>
//           </div>
//         )}
//         {!isLoading && userList.length === 0 && (
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2 shadow-sm">
//             <span className="text-3xl">🚫</span>
//             <span>No records found matching your view permissions.</span>
//           </div>
//         )}

//               {/* ১. গ্রিড কার্ড লেআউট */}
//         {!isLoading && viewMode === 'grid' && userList.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {userList.map((user) => (
//               <div 
//                 key={user._id?.$oid || user._id} 
//                 className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between"
//               >
//                 {/* অ্যাক্টিভ লাইফসাইকেল স্ট্যাটাস */}
//                 <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
//                   user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                 }`}>
//                   {user.isActive ? '● Active' : '○ Inactive'}
//                 </span>

//                 <div className="p-5 flex flex-col items-center text-center">
//                   <img
//                     src={getImageUrl(user.photo)}
//                     alt={user.name}
//                     className="w-20 h-20 rounded-2xl object-cover border border-gray-150 shadow-sm mb-4 bg-gray-50"
//                     onError={(e) => { e.target.src = ''; }}
//                   />
//                   <h3 className="text-base font-bold text-gray-900 tracking-tight">{user.name}</h3>
                  
//                   {/* ডাইনামিক কর্পোরেট র‍্যাংক ব্যাজ */}
//                   <div className="flex items-center gap-1.5 mt-1">
//                     <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${getRankBadgeStyles(user.rank)}`}>
//                       {user.rank || 'Staff'}
//                     </span>
//                     <span className="text-xs font-medium text-gray-300">|</span>
//                     <span className="text-xs text-gray-500 font-mono font-semibold">{user.idNo || 'N/A'}</span>
//                   </div>

//                   <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📞</span><span className="font-medium tracking-wide">{user.mobileNo || 'N/A'}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">✉️</span><span className="truncate max-w-[180px]">{user.email}</span></div>
//                     <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📍</span><span className="truncate max-w-[180px]">{user.address || 'N/A'}</span></div>
//                   </div>
//                 </div>

//                 <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
//                   <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Role: {user.role || 'User'}</span>
//                   <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View Profile →</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* =========================================================================
//             💡 ২. ডাটাসেন্ট্রিক টেবিল লেআউট (Corporate Data Table Layout)
//             ========================================================================= */}
//         {!isLoading && viewMode === 'table' && userList.length > 0 && (
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse whitespace-nowrap">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
//                     <th className="p-4 text-center w-12">Photo</th>
//                     <th className="p-4">Employee Details</th>
//                     <th className="p-4">ID Number</th>
//                     <th className="p-4">Rank / Designation</th>
//                     <th className="p-4">Contact Info</th>
//                     <th className="p-4">Location</th>
//                     <th className="p-4 text-center">Status</th>
//                     {isAdmin && <th className="p-4 text-center">Actions</th>}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                   {userList.map((user) => (
//                     <tr key={user._id?.$oid || user._id} className="hover:bg-gray-50/70 transition-colors">
//                       <td className="p-4 text-center">
//                         <img
//                           src={getImageUrl(user.photo)}
//                           alt={user.name}
//                           className="w-10 h-10 rounded-xl object-cover mx-auto border border-gray-200 shadow-sm"
//                           onError={(e) => { e.target.src = ''; }}
//                         />
//                       </td>
//                       <td className="p-4">
//                         <div className="font-bold text-gray-900">{user.name}</div>
//                         <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
//                       </td>
//                       <td className="p-4 font-mono font-semibold text-xs text-gray-600">{user.idNo || 'N/A'}</td>
//                       <td className="p-4">
//                         <span className={`px-2.5 py-1 border text-xs font-extrabold rounded-md uppercase tracking-wider ${getRankBadgeStyles(user.rank)}`}>
//                           {user.rank || 'Staff'}
//                         </span>
//                       </td>
//                       <td className="p-4 font-medium tracking-wide text-xs">{user.mobileNo || 'N/A'}</td>
//                       <td className="p-4">
//                         <div className="text-xs font-medium text-gray-900">{user.address || 'N/A'}</div>
//                         {user.district && <div className="text-[10px] text-gray-400 mt-0.5">{user.district}</div>}
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
//                           user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//                         }`}>
//                           {user.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       {isAdmin && (
//                         <td className="p-4 text-center">
//                           <button className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">Manage</button>
//                         </td>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* পেজিনেশন কন্ট্রোল ফুটার */}
//       {!isLoading && totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 bg-white p-4 rounded-2xl shadow-sm border">
//           <span className="text-xs font-medium text-gray-500">
//             Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong>
//           </span>
          
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               ◀ Previous
//             </button>
            
//             {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
//               <button
//                 key={pageNum}
//                 onClick={() => setCurrentPage(pageNum)}
//                 className={`w-9 h-9 text-xs font-bold rounded-xl transition-all shadow-sm border ${
//                   currentPage === pageNum 
//                     ? 'bg-blue-600 text-white border-blue-600' 
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 {pageNum}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               Next ▶
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import { useState, useEffect } from 'react';

// export default function UserProfileView({ currentUser = { role: 'client' } }) {
//   const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

//   // ১. কোর স্টেট ম্যানেজমেন্ট
//   const [userList, setUserList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
//   const [searchQuery, setSearchQuery] = useState('');

//   // ২. পেজিনেশন স্টেট
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const limit = 50; 

//   const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

//   // ৩. এপিআই থেকে ডাটা ফেচ করা
//   useEffect(() => {
//     const fetchPaginatedUsers = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(
//           `${SERVER_URL}/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
//         );
//         const result = await response.json();
        
//         if (result.success && result.data) {
//           setUserList(result.data);
//           setTotalPages(result.pagination?.totalPages || 1);
//           setTotalUsers(result.pagination?.totalUsers || result.data.length);
//         } else if (Array.isArray(result)) {
//           setUserList(result);
//         }
//       } catch (error) {
//         console.error("Roster data load failed:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const delayDebounce = setTimeout(() => {
//       fetchPaginatedUsers();
//     }, 400);

//     return () => clearTimeout(delayDebounce);
//   }, [currentPage, searchQuery, SERVER_URL]);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   const getImageUrl = (photoPath) => {
//     if (!photoPath) return 'https://unsplash.com';
//     return `${SERVER_URL}/${photoPath.replace(/\\/g, '/')}`;
//   };

//   // 💡 ৪. সিরিয়াল বা র্যাংক অনুযায়ী ইউজারদের আলাদা আলাদা গ্রুপে বিভক্ত করা (ED -> NSM -> DSM -> BOM)
//   const edUsers = userList.filter(u => u.rank?.toUpperCase() === 'ED' || u.rank?.toUpperCase() === 'EX DIR');
//   const nsmUsers = userList.filter(u => u.rank?.toUpperCase() === 'NSM');
//   const dsmUsers = userList.filter(u => u.rank?.toUpperCase() === 'DSM');
//   const bomUsers = userList.filter(u => u.rank?.toUpperCase() === 'BOM');

//   // রেন্ডারিং হেল্পার কম্পোনেন্ট (একক ইউজার কার্ডের জন্য)
//   const RenderUserCard = ({ user, themeColor, badgeClass }) => (
//     <div key={user._id?.$oid || user._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between">
//       <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
//         user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
//       }`}>
//         {user.isActive ? '● Active' : '○ Inactive'}
//       </span>

//       <div className="p-5 flex flex-col items-center text-center">
//         <img
//           src={getImageUrl(user.photo)}
//           alt={user.name}
//           className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-sm mb-4 bg-gray-50 ${themeColor}`}
//           onError={(e) => { e.target.src = ''; }}
//         />
//         <h3 className="text-base font-bold text-gray-900 tracking-tight">{user.name}</h3>
        
//         <div className="flex items-center gap-1.5 mt-1">
//           <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${badgeClass}`}>
//             {user.rank || 'Staff'}
//           </span>
//           <span className="text-xs font-medium text-gray-300">|</span>
//           <span className="text-xs text-gray-500 font-mono font-semibold">{user.idNo || 'N/A'}</span>
//         </div>

//         <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
//           <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📞</span><span className="font-medium tracking-wide">{user.mobileNo || 'N/A'}</span></div>
//           <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">✉️</span><span className="truncate max-w-[180px]">{user.email}</span></div>
//           <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📍</span><span className="truncate max-w-[180px]">{user.address || 'N/A'}</span></div>
//         </div>
//       </div>

//       <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
//         <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Role: {user.role || 'User'}</span>
//         <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View Profile →</button>
//       </div>
//     </div>
//   );

//   // রেন্ডারিং হেল্পার কম্পোনেন্ট (টেবিল রো-এর জন্য)
//   const RenderTableRow = ({ user, badgeClass }) => (
//     <tr key={user._id?.$oid || user._id} className="hover:bg-gray-50/70 transition-colors">
//       <td className="p-4 text-center">
//         <img src={getImageUrl(user.photo)} alt={user.name} className="w-10 h-10 rounded-xl object-cover mx-auto border border-gray-200 shadow-sm" onError={(e) => { e.target.src = 'https://unsplash.com'; }} />
//       </td>
//       <td className="p-4"><div className="font-bold text-gray-900">{user.name}</div><div className="text-xs text-gray-400 mt-0.5">{user.email}</div></td>
//       <td className="p-4 font-mono font-semibold text-xs text-gray-600">{user.idNo || 'N/A'}</td>
//       <td className="p-4"><span className={`px-2.5 py-1 border text-xs font-extrabold rounded-md uppercase tracking-wider ${badgeClass}`}>{user.rank || 'Staff'}</span></td>
//       <td className="p-4 font-medium tracking-wide text-xs">{user.mobileNo || 'N/A'}</td>
//       <td className="p-4"><div className="text-xs font-medium text-gray-900">{user.address || 'N/A'}</div>{user.district && <div className="text-[10px] text-gray-400 mt-0.5">{user.district}</div>}</td>
//       <td className="p-4 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
//       {isAdmin && (
//         <td className="p-4 text-center">
//           <button className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">Manage</button>
//         </td>
//       )}
//     </tr>
//   );

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
//       <div>
//         {/* হেডার সেকশন */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Leadership Roster</h2>
//             <p className="text-sm text-gray-500 mt-1">
//               Showing {userList.length > 0 ? (currentPage - 1) * limit + 1 : 0}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers} National Management Profiles
//             </p>
//           </div>
          
//           <div className="flex items-center bg-gray-200 p-1 rounded-xl shadow-inner">
//             <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>🎴 Card Grid</button>
//             <button onClick={() => setViewMode('table')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>📋 Data Table</button>
//           </div>
//         </div>

//         {/* সার্চ বার ইনপুট */}
//         <div className="w-full mb-8 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
//           <div className="relative">
//             <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
//             <input type="text" placeholder="Search by name, idNo or phone..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
//           </div>
//         </div>

//         {/* লোডিং ইন্ডিকেটর */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-24 text-gray-500 font-medium text-sm gap-2">
//             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <span>Loading serialized registry batch...</span>
//           </div>
//         )}

//         {!isLoading && userList.length === 0 && (
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2 shadow-sm">
//             <span className="text-3xl">🚫</span>
//             <span>No operational entries match your criteria.</span>
//           </div>
//         )}

//         {/* =========================================================================
//             💡 গ্রিড ভিউ মোড (সিরিয়াল ফ্রেম ডিজাইন)
//             ========================================================================= */}
//         {!isLoading && viewMode === 'grid' && userList.length > 0 && (
//           <div className="space-y-12">

//              {/* 🟢 FRAME 4: BUSINESS OPERATIONS MANAGEMENT (BOM) */}
//             {bomUsers.length > 0 && (
//               <div className="bg-emerald-50/30 border border-emerald-200/60 p-6 rounded-3xl shadow-sm">
//                 <div className="flex items-center gap-2 mb-4 border-b border-emerald-200/50 pb-2">
//                   <span className="text-xl">⚙️</span>
//                   <h4 className="text-md font-extrabold text-emerald-800 uppercase tracking-wider">Business Operations Management (BOM) Frame</h4>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {bomUsers.map(user => (
//                     <RenderUserCard 
//                       key={user._id?.$oid || user._id}
//                       user={user} 
//                       themeColor="border-emerald-500/40" 
//                       badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200" 
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {/* 🔴 FRAME 1: EXECUTIVE DIRECTOR (ED) */}
//             {edUsers.length > 0 && (
//               <div className="bg-red-50/30 border border-red-200/60 p-6 rounded-3xl shadow-sm">
//                 <div className="flex items-center gap-2 mb-4 border-b border-red-200/50 pb-2">
//                   <span className="text-xl">👑</span>
//                   <h4 className="text-md font-extrabold text-red-800 uppercase tracking-wider">Executive Director (ED) Frame</h4>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {edUsers.map(user => (
//                     <RenderUserCard 
//                       key={user._id?.$oid || user._id}
//                       user={user} 
//                       themeColor="border-red-500/40" 
//                       badgeClass="bg-red-50 text-red-700 border-red-200" 
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* 🟣 FRAME 2: NATIONAL SALES MANAGER (NSM) */}
//             {nsmUsers.length > 0 && (
//               <div className="bg-purple-50/30 border border-purple-200/60 p-6 rounded-3xl shadow-sm">
//                 <div className="flex items-center gap-2 mb-4 border-b border-purple-200/50 pb-2">
//                   <span className="text-xl">🎯</span>
//                   <h4 className="text-md font-extrabold text-purple-800 uppercase tracking-wider">National Sales Manager (NSM) Frame</h4>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {nsmUsers.map(user => (
//                     <RenderUserCard 
//                       key={user._id?.$oid || user._id}
//                       user={user} 
//                       themeColor="border-purple-500/40" 
//                       badgeClass="bg-purple-50 text-purple-700 border-purple-200" 
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* 🔵 FRAME 3: DIVISIONAL SALES MANAGER (DSM) */}
//             {dsmUsers.length > 0 && (
//               <div className="bg-blue-50/30 border border-blue-200/60 p-6 rounded-3xl shadow-sm">
//                 <div className="flex items-center gap-2 mb-4 border-b border-blue-200/50 pb-2">
//                   <span className="text-xl">💼</span>
//                   <h4 className="text-md font-extrabold text-blue-800 uppercase tracking-wider">Divisional Sales Manager (DSM) Frame</h4>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {dsmUsers.map(user => (
//                     <RenderUserCard 
//                       key={user._id?.$oid || user._id}
//                       user={user} 
//                       themeColor="border-blue-500/40" 
//                       badgeClass="bg-blue-50 text-blue-700 border-blue-200" 
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//           </div>
//         )}

//         {/* =========================================================================
//             💡 টেবিল ভিউ মোড (সিরিয়াল সেকশন ডিজাইন)
//             ========================================================================= */}
//         {!isLoading && viewMode === 'table' && userList.length > 0 && (
//           <div className="space-y-8">
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse whitespace-nowrap">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
//                       <th className="p-4 text-center w-12">Photo</th>
//                       <th className="p-4">Employee Details</th>
//                       <th className="p-4">ID Number</th>
//                       <th className="p-4">Rank / Designation</th>
//                       <th className="p-4">Contact Info</th>
//                       <th className="p-4">Location</th>
//                       <th className="p-4 text-center">Status</th>
//                       {isAdmin && <th className="p-4 text-center">Actions</th>}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
//                     {/* টেবিল লুপে সিরিয়াল অনুযায়ী ক্যাটাগরি রেন্ডার */}
//                     {edUsers.map(user => <RenderTableRow key={user._id?.$oid || user._id} user={user} badgeClass="bg-red-50 text-red-700 border-red-200" />)}
//                     {nsmUsers.map(user => <RenderTableRow key={user._id?.$oid || user._id} user={user} badgeClass="bg-purple-50 text-purple-700 border-purple-200" />)}
//                     {dsmUsers.map(user => <RenderTableRow key={user._id?.$oid || user._id} user={user} badgeClass="bg-blue-50 text-blue-700 border-blue-200" />)}
//                     {bomUsers.map(user => <RenderTableRow key={user._id?.$oid || user._id} user={user} badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200" />)}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* পেজিনেশন কন্ট্রোল ফুটার */}
//       {!isLoading && totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 bg-white p-4 rounded-2xl shadow-sm border">
//           <span className="text-xs font-medium text-gray-500">Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong></span>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">◀ Previous</button>
//             {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
//               <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-9 h-9 text-xs font-bold rounded-xl transition-all shadow-sm border ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
//             ))}
//             <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next ▶</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from 'react';

export default function UserProfileView() {
  // 💡 1. Extract Role Dynamically from LocalStorage
  const storedRole = localStorage.getItem('userRole') || 'employee';
  const isAdmin = storedRole.toLowerCase() === 'admin';
  const isManager = storedRole.toLowerCase() === 'managers' || storedRole.toLowerCase() === 'manager';
  const hasGlobalAccess = isAdmin || isManager; // Both Admin and Managers get full view controls

  // 2. Core State Management
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 💡 Security Gate: If employee, lock them strictly to MARKETING. If admin/manager, unlock ALL.
  const [selectedTeam, setSelectedTeam] = useState(hasGlobalAccess ? 'ALL' : 'MARKETING');

  // 3. Server-Side Pagination States (50 Users Batch Limit)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 50; 

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // 4. Fetch Paginated and Filtered Live Data from Express Endpoint
  useEffect(() => {
    const fetchPaginatedUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${SERVER_URL}/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&team=${selectedTeam}`
        );
        const result = await response.json();
        
        if (result.success && result.data) {
          setUserList(result.data);
          setTotalPages(result.pagination?.totalPages || 1);
          setTotalUsers(result.pagination?.totalUsers || result.data.length);
        } else if (Array.isArray(result)) {
          setUserList(result);
        }
      } catch (error) {
        console.error("User roster framework fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the keyboard inputs slightly to prevent network spamming
    const delayDebounce = setTimeout(() => {
      fetchPaginatedUsers();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchQuery, selectedTeam, SERVER_URL]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Drop index back to page 1 on active search parameters change
  };

  const handleTeamChange = (teamValue) => {
    if (!hasGlobalAccess && teamValue !== 'MARKETING') return; // Enforce local system gate
    setSelectedTeam(teamValue);
    setCurrentPage(1);
  };

  // Safe Image String parser for cross-platform backslash safety
  const getImageUrl = (photoPath) => {
    if (!photoPath) return '';
    return `${SERVER_URL}/${photoPath.replace(/\\/g, '/')}`;
  };

  // 💡 5. Synchronous Client-Side Sorting & Array Partition Hooks
  const edUsers = userList.filter(u => u.rank?.toUpperCase() === 'ED' || u.rank?.toUpperCase() === 'EX DIR');
  const nsmUsers = userList.filter(u => u.rank?.toUpperCase() === 'NSM');
  const dsmUsers = userList.filter(u => u.rank?.toUpperCase() === 'DSM');
  const bomUsers = userList.filter(u => u.rank?.toUpperCase() === 'BOM');
  
  // Fallback catch grouping array for standalone admin logs, managers, or non-marketing tags
  const corporateUsers = userList.filter(u => {
    const r = u.rank?.toUpperCase();
    return r !== 'ED' && r !== 'EX DIR' && r !== 'NSM' && r !== 'DSM' && r !== 'BOM';
  });

  // Dynamic Color Palette Mapping configurations based on Title rank parameters
  const getRankBadgeStyles = (rank) => {
    const r = rank?.toUpperCase() || '';
    if (r === 'EX DIR' || r === 'ED') return 'bg-red-50 text-red-700 border-red-200';
    if (r === 'NSM') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r === 'DSM') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r === 'BOM') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Reusable Isolated UI Atom Component: Individual Profile Card
  const RenderUserCard = ({ user, borderTheme, badgeClass }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col justify-between">
      <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
        user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        {user.isActive ? '● Active' : '○ Inactive'}
      </span>

      <div className="p-5 flex flex-col items-center text-center">
        <img
          src={getImageUrl(user.photo)}
          alt={user.name}
          className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-sm mb-4 bg-gray-50 ${borderTheme}`}
          onError={(e) => { e.target.src = ''; }}
        />
        <h3 className="text-base font-bold text-gray-900 tracking-tight">{user.name}</h3>
        
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${badgeClass}`}>
            {user.rank || 'Staff'}
          </span>
          <span className="text-xs font-medium text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-mono font-semibold">{user.idNo || 'N/A'}</span>
        </div>

        <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2 text-left text-xs text-gray-600">
          <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📞</span><span className="font-medium tracking-wide">{user.mobileNo || 'N/A'}</span></div>
          <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">✉️</span><span className="truncate max-w-[180px]">{user.email}</span></div>
          <div className="flex items-center gap-2"><span className="text-gray-400 w-4 text-center">📍</span><span className="truncate max-w-[180px]">{user.address || 'N/A'}</span></div>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Role: {user.role || 'User'}</span>
        <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View Profile →</button>
      </div>
    </div>
  );

  // Reusable Isolated UI Atom Component: Individual Data Table Row
  const RenderTableRow = ({ user, badgeClass }) => (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="p-4 text-center">
        <img src={getImageUrl(user.photo)} alt={user.name} className="w-10 h-10 rounded-xl object-cover mx-auto border border-gray-200 shadow-sm" onError={(e) => { e.target.src = ''; }} />
      </td>
      <td className="p-4"><div className="font-bold text-gray-900">{user.name}</div><div className="text-xs text-gray-400 mt-0.5">{user.email}</div></td>
      <td className="p-4 font-mono font-semibold text-xs text-gray-600">{user.idNo || 'N/A'}</td>
      <td className="p-4"><span className={`px-2.5 py-1 border text-xs font-extrabold rounded-md uppercase tracking-wider ${badgeClass}`}>{user.rank || 'Staff'}</span></td>
      <td className="p-4 font-medium tracking-wide text-xs">{user.mobileNo || 'N/A'}</td>
      <td className="p-4"><div className="text-xs font-medium text-gray-900">{user.address || 'N/A'}</div>{user.district && <div className="text-[10px] text-gray-400 mt-0.5">{user.district}</div>}</td>
      <td className="p-4 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
      {hasGlobalAccess && (
        <td className="p-4 text-center">
          <button className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">Manage</button>
        </td>
      )}
    </tr>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
      <div>
                {/* Main Dashboard Control Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Portfolio Roster</h2>
            <p className="text-sm text-gray-500 mt-1">
              Active User Role: <strong className="text-blue-600 uppercase font-mono">{storedRole}</strong> | Showing {userList.length > 0 ? (currentPage - 1) * limit + 1 : 0}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers} Profiles
            </p>
          </div>
          
          <div className="flex items-center bg-gray-200 p-1 rounded-xl shadow-inner">
            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>🎴 Card Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>📋 Data Table</button>
          </div>
        </div>

        {/* 🏢 Categorized Navigation Tabs (Enforces LocalStorage Conditional Access Controls) */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {hasGlobalAccess ? (
            <>
              <button
                onClick={() => handleTeamChange('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                🌎 All Roster
              </button>
              <button
                onClick={() => handleTeamChange('CORPORATE')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'CORPORATE' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                🏢 Corporate (Admin / Managers)
              </button>
              <button
                onClick={() => handleTeamChange('MARKETING')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTeam === 'MARKETING' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                🚀 Marketing Team (BOM / Ex Dir / NSM / DSM)
              </button>
            </>
          ) : (
            <div className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
              🚀 Marketing Strategy Portfolio (BOM / Ex Dir / NSM )
            </div>
          )}
        </div>

        {/* Search Bar Input Grid Layer */}
        <div className="w-full mb-8 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-gray-400">🔍</span>
            <input type="text" placeholder="Filter roster live by name, ID number, or phone metrics..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        {/* Live IO Status Indicators */}
        {isLoading && (
          <div className="flex justify-center items-center py-24 text-gray-500 font-medium text-sm gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading optimized registry batch...</span>
          </div>
        )}

        {!isLoading && userList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium text-sm flex flex-col items-center justify-center gap-2 shadow-sm">
            <span className="text-3xl">🚫</span>
            <span>No data records found under this directory filter scope.</span>
          </div>
        )}

        {/* =========================================================================
            💡 1. Grid Card Layout (Rank Isolated Custom Serial Frames)
            ========================================================================= */}
        {!isLoading && viewMode === 'grid' && userList.length > 0 && (
          <div className="space-y-12">

            {/* 🟢 FRAME 4: BUSINESS OPERATIONS MANAGEMENT (BOM) */}
            {bomUsers.length > 0 && (
              <div className="bg-emerald-50/20 border border-emerald-200/50 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-emerald-200/40 pb-2">
                  <span className="text-xl">⚙️</span>
                  <h4 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider">Business Operations Management (BOM) Frame</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bomUsers.map(user => <RenderUserCard key={user._id?.$oid || user._id} user={user} borderTheme="border-emerald-500/30" badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200" />)}
                </div>
              </div>
            )}
            
            {/* 🔴 FRAME 1: EXECUTIVE DIRECTOR (ED) */}
            {edUsers.length > 0 && (
              <div className="bg-red-50/20 border border-red-200/50 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-red-200/40 pb-2">
                  <span className="text-xl">👑</span>
                  <h4 className="text-sm font-extrabold text-red-800 uppercase tracking-wider">Executive Director (ED) Frame</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {edUsers.map(user => <RenderUserCard key={user._id?.$oid || user._id} user={user} borderTheme="border-red-500/30" badgeClass="bg-red-50 text-red-700 border-red-200" />)}
                </div>
              </div>
            )}

            {/* 🟣 FRAME 2: NATIONAL SALES MANAGER (NSM) */}
            {nsmUsers.length > 0 && (
              <div className="bg-purple-50/20 border border-purple-200/50 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-purple-200/40 pb-2">
                  <span className="text-xl">🎯</span>
                  <h4 className="text-sm font-extrabold text-purple-800 uppercase tracking-wider">National Sales Manager (NSM) Frame</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {nsmUsers.map(user => <RenderUserCard key={user._id?.$oid || user._id} user={user} borderTheme="border-purple-500/30" badgeClass="bg-purple-50 text-purple-700 border-purple-200" />)}
                </div>
              </div>
            )}

            {/* 🔵 FRAME 3: DIVISIONAL SALES MANAGER (DSM)
            {dsmUsers.length > 0 && (
              <div className="bg-blue-50/20 border border-blue-200/50 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-blue-200/40 pb-2">
                  <span className="text-xl">💼</span>
                  <h4 className="text-sm font-extrabold text-blue-800 uppercase tracking-wider">Divisional Sales Manager (DSM) Frame</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {dsmUsers.map(user => <RenderUserCard key={user._id?.$oid || user._id} user={user} borderTheme="border-blue-500/30" badgeClass="bg-blue-50 text-blue-700 border-blue-200" />)}
                </div>
              </div>
            )} */}

            

            {/* 🔘 STANDALONE OVERFLOW FRAME (Corporate Staff / Admin Logs Only visible to higher scopes) */}
            {corporateUsers.length > 0 && selectedTeam !== 'MARKETING' && (
              <div className="bg-slate-100 border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <span className="text-xl">🏢</span>
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Corporate Administration Frame</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {corporateUsers.map(user => <RenderUserCard key={user._id?.$oid || user._id} user={user} borderTheme="border-slate-500/30" badgeClass="bg-slate-50 text-slate-700 border-slate-200" />)}
                </div>
              </div>
            )}

          </div>
        )}

              {/* =========================================================================
            💡 2. Corporate Data Table View Mode Configuration Layer
            ========================================================================= */}
        {!isLoading && viewMode === 'table' && userList.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <th className="p-4 text-center w-12">Photo</th>
                    <th className="p-4">Employee Details</th>
                    <th className="p-4">ID Number</th>
                    <th className="p-4">Rank / Designation</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Status</th>
                    {hasGlobalAccess && <th className="p-4 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {/* Serial execution layer for mapping rows sequentially */}
                  {edUsers.map(user => (
                    <RenderTableRow 
                      key={user._id?.$oid || user._id} 
                      user={user} 
                      badgeClass="bg-red-50 text-red-700 border-red-200" 
                    />
                  ))}
                  {nsmUsers.map(user => (
                    <RenderTableRow 
                      key={user._id?.$oid || user._id} 
                      user={user} 
                      badgeClass="bg-purple-50 text-purple-700 border-purple-200" 
                    />
                  ))}
                  {dsmUsers.map(user => (
                    <RenderTableRow 
                      key={user._id?.$oid || user._id} 
                      user={user} 
                      badgeClass="bg-blue-50 text-blue-700 border-blue-200" 
                    />
                  ))}
                  {bomUsers.map(user => (
                    <RenderTableRow 
                      key={user._id?.$oid || user._id} 
                      user={user} 
                      badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200" 
                    />
                  ))}
                  {corporateUsers.map(user => (
                    <RenderTableRow 
                      key={user._id?.$oid || user._id} 
                      user={user} 
                      badgeClass="bg-slate-50 text-slate-700 border-slate-200" 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ⚙️ 5. Pagination Control Footer Grid
          ========================================================================= */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 bg-white p-4 rounded-2xl shadow-sm border">
          <span className="text-xs font-medium text-gray-500">
            Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong>
          </span>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ◀ Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
              <button 
                key={pageNum} 
                onClick={() => setCurrentPage(pageNum)} 
                className={`w-9 h-9 text-xs font-bold rounded-xl transition-all shadow-sm border ${
                  currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages} 
              className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl shadow-sm transition-all text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
