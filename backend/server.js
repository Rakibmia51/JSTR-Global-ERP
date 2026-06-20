const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js'); // require দিয়ে ফাইল ইম্পোর্ট

// এনভায়রনমেন্ট ভেরিয়েবল লোড করা
dotenv.config();

// ডাটাবেজ কানেক্ট করা
connectDB();

const app = express();

// মিডলওয়্যার সেটআপ
app.use(cors());
app.use(express.json());

// রাউট ইম্পোর্ট করা
const userRoutes = require('./routes/userRoutes');

// এপিআই রাউট লিংক
app.use('/api/users', userRoutes);

// বেসিক টেস্ট রাউট
app.get('/', (req, res) => {
  res.send('JSTR Global ERP Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port http://localhost:${PORT}`);
});
