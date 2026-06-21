import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api', // আপনার ব্যাকএন্ড এপিআই ইউআরএল
});

// প্রতি রিকোয়েস্টের সাথে লোকাল স্টোরেজ থেকে টোকেন অটোমেটিক পাঠিয়ে দেবে
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
