// 💥 মূল ফিক্স: ফাইলের একদম উপরে মঙ্গুজ রিকোয়ার বা ইমপোর্ট করতে হবে 
const mongoose = require('mongoose'); 

const updateEmployeeRankByAdmin = async (req, res) => {
  try {
    const { idNo, newRank } = req.body;

    // ১. ভ্যালিডেশন চেক
    if (!idNo || !newRank) {
      return res.status(400).json({ 
        success: false, 
        message: "আইডি নম্বর (idNo) এবং নতুন র‍্যাংক (newRank) প্রদান করা আবশ্যক।" 
      });
    }

    // আপনার সিস্টেমের ভ্যালিড র‍্যাংক লিস্ট
    const VALID_RANKS = [
      "SALES REPRESENTATIVE", "AM", "RSM", "DSM", 
      "SDSM", "SM", "NSM", "ED", "BOM"
    ];

    const formattedRank = newRank.toUpperCase().trim();

    if (!VALID_RANKS.includes(formattedRank)) {
      return res.status(400).json({ 
        success: false, 
        message: "প্রদত্ত র‍্যাংকটি সঠিক নয়। অনুগ্রহ করে সঠিক র‍্যাংক সিলেক্ট করুন।" 
      });
    }

    // এই ২৮ নম্বর লাইনে এখন আর এরর আসবে না
    const db = mongoose.connection.db;

    // ২. ডাটাবেজে ইউজারের র‍্যাংক সরাসরি আপডেট করা
    const updateResult = await db.collection("users").updateOne(
      { idNo: idNo },
      { $set: { rank: formattedRank } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "দুঃখিত, এই আইডি নম্বরের কোনো ইউজার পাওয়া যায়নি।" 
      });
    }

    return res.status(200).json({
      success: true,
      message: `আইডি নম্বর ${idNo}-এর র‍্যাংক সফলভাবে আপডেট করে '${formattedRank}' করা হয়েছে।`
    });

  } catch (error) {
    console.error("❌ ADMIN RANK UPDATE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// আপনার এক্সপোর্ট স্টেটমেন্টটি নিচে যেভাবে আছে সেভাবে রাখুন, যেমন:
module.exports = { updateEmployeeRankByAdmin };
