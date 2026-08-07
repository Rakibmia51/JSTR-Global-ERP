const User = require('../models/User');
const Dealer = require('../models/Dealer');
const Invoice = require('../models/Invoice');

// controllers/salesController.js
const mongoose = require('mongoose');


// 1st version of sales controller with native MongoDB driver for performance optimization
//  const getSalesWithEmployee = async (req, res) => {
//   try {
//     // 💡 সমাধান: মঙ্গুজ মডেল এভয়েড করে সরাসরি নেটিভ ড্রাইভার দিয়ে ডাটাবেজ কানেক্ট করা
//     // আপনার ডাটাবেজে কালেকশনের নাম 'sales' অথবা 'invoices' হতে পারে। আমরা দুটিই চেক করার ব্যবস্থা রেখেছি:
//     const db = mongoose.connection.db;
    
//     // ১. প্রথমে 'sales' কালেকশনে খোঁজ করা, না পাওয়া গেলে 'invoices' কালেকশনে খোঁজ করা
//     let allSales = await db.collection("sales").find({}).toArray();
//     if (!allSales || allSales.length === 0) {
//       allSales = await db.collection("invoices").find({}).toArray();
//     }

//     // ডাটাবেজে যদি তাও না পাওয়া যায় সেফটি মেসেজ
//     if (!allSales || allSales.length === 0) {
//       return res.status(200).json({ message: "No invoices found in raw collections" });
//     }

//     // ২. লুপ চালিয়ে ডিলার এবং ডিলারের আন্ডারে থাকা MKT Employee ডাটা মার্চ (Merge) করা
//     const enrichedSales = await Promise.all(
//       allSales.map(async (sale) => {
//         let dealerInfo = null;
//         let employeeInfo = null;

//         if (sale.dealer) {
//           // স্ট্রিং বা অবজেক্ট আইডি উভয় ফরম্যাটেই ডিলার খোঁজা যেন মিস না হয়
//           const dealerId = sale.dealer.toString();
//           dealerInfo = await Dealer.findOne({ 
//             $or: [
//               { _id: dealerId },
//               { _id: new mongoose.Types.ObjectId(dealerId) }
//             ]
//           }).lean();
          
//           // ডিলার পাওয়া গেলে তার 'referenceIdNo' (MKT-0008) দিয়ে এমপ্লয়ি খোঁজা
//           if (dealerInfo && dealerInfo.referenceIdNo) {
//             employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo })
//               .select("name idNo role department")
//               .lean();
//           }
//         }

//         return {
//           ...sale,
//           _id: sale._id.toString(), // ফ্রন্টএন্ডে ইউনিক কী (Key) এররের জন্য স্ট্রিং কনভার্ট
//           dealer: dealerInfo,
//           employeeInfo: employeeInfo
//         };
//       })
//     );

//     res.status(200).json(enrichedSales);
//   } catch (error) {
//     console.error("Native Sales Engine Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getSalesWithEmployee,
// };


// 2nd version of sales controller with mongoose population for simplicity

const getSalesWithEmployee = async (req, res) => {
  try {
    // ১. সরাসরি মঙ্গুজ মডেল ব্যবহার করে সব ইনভয়েস নিয়ে আসা (এটি ফাস্ট এবং সিকিউর)
    const allSales = await Invoice.find({}).lean();

    if (!allSales || allSales.length === 0) {
      return res.status(200).json({ message: "No invoices found" });
    }

    // ২. লুপ চালিয়ে আর্কাইভড ও লাইভ ডাটা ডাইনামিকালি মার্চ করা
    const enrichedSales = await Promise.all(
      allSales.map(async (sale) => {
        
        // ক) যদি ইনভয়েসটি ইতিমধ্যে মাসের শেষে আর্কাইভড হয়ে থাকে (isMonthlyArchived: true)
        if (sale.isMonthlyArchived && sale.archivedSalesData) {
          return {
            ...sale,
            _id: sale._id.toString(),
            // আর্কাইভড স্ন্যাপশট ডাটাকে আগের ফরম্যাটের সাথে মিল রেখে রিটার্ন করা
            dealer: sale.archivedSalesData.dealerSnapshot || null,
            employeeInfo: sale.archivedSalesData.employeeSnapshot || null,
            isArchivedRecord: true // ফ্রন্টএন্ডে ট্র্যাকিংয়ের জন্য একটি ফ্ল্যাগ
          };
        }

        // খ) যদি ইনভয়েসটি রানিং মাসের হয় (এখনো আর্কাইভ করা হয়নি)
        let dealerInfo = null;
        let employeeInfo = null;

        if (sale.dealer) {
          const dealerId = sale.dealer.toString();
          
          // লাইভ ডিলার ডাটা খোঁজা
          dealerInfo = await Dealer.findOne({ 
            $or: [
              { _id: dealerId },
              { _id: new mongoose.Types.ObjectId(dealerId) }
            ]
          }).lean();
          
          // ডিলারের লাইভ 'referenceIdNo' দিয়ে কারেন্ট এমপ্লয়ি খোঁজা
          if (dealerInfo && dealerInfo.referenceIdNo) {
            employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo })
              .select("name idNo role department")
              .lean();
          }
        }

        return {
          ...sale,
          _id: sale._id.toString(),
          dealer: dealerInfo,
          employeeInfo: employeeInfo,
          isArchivedRecord: false
        };
      })
    );

    res.status(200).json(enrichedSales);
  } catch (error) {
    console.error("Sales Engine Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 ৩. প্রতি মাসের শেষে রান করার জন্য ম্যানুয়াল/অটোমেটিক আর্কাইভ ফাংশন
// এটি কল করলে রানিং মাসের সব ইনভয়েস লক হয়ে যাবে এবং ভবিষ্যতে আইডি চেঞ্জ হলেও ডাটা মুছবে না
const archiveMonthlySales = async (req, res) => {
  try {
    // যে ইনভয়েসগুলো এখনো আর্কাইভ করা হয়নি সেগুলো খুঁজে বের করা
    const pendingInvoices = await Invoice.find({ isMonthlyArchived: false });

    if (!pendingInvoices || pendingInvoices.length === 0) {
      return res.status(200).json({ message: "All invoices are already archived for this month." });
    }

    let archivedCount = 0;

    for (let invoice of pendingInvoices) {
      if (invoice.dealer) {
        const dealerInfo = await Dealer.findById(invoice.dealer).lean();
        
        if (dealerInfo) {
          const employeeInfo = await User.findOne({ idNo: dealerInfo.referenceIdNo }).lean();

          // ইনভয়েস মডেলে স্থায়ীভাবে স্ন্যাপশট অবজেক্ট রাইট করা
          invoice.archivedSalesData = {
            dealerSnapshot: {
              idNo: dealerInfo.dealerId,
              name: dealerInfo.name
            },
            employeeSnapshot: employeeInfo ? {
              idNo: employeeInfo.idNo,
              name: employeeInfo.name,
              department: employeeInfo.department || 'MKT'
            } : { idNo: 'N/A', name: 'System/Deleted', department: 'MKT' },
            archivedAt: new Date()
          };

          invoice.isMonthlyArchived = true;
          await invoice.save();
          archivedCount++;
        }
      }
    }

    res.status(200).json({ 
      message: `Success! Successfully archived and locked ${archivedCount} invoices for this month.` 
    });

  } catch (error) {
    console.error("Archive Process Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesWithEmployee,
  archiveMonthlySales // নতুন রুট হ্যান্ডলার
};
