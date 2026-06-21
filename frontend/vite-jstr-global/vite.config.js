import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // নতুন v4 প্লাগইন ইম্পোর্ট করলেন

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // এখানে প্লাগইনটি যুক্ত করে দিলেন
  ],
})
