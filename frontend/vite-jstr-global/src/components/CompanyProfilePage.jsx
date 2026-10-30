import  { useState, useEffect } from "react";
import API from '../api'; // আপনার Axios/API ক্লায়েন্ট পাথ
const BACKEND_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
import { Navigate } from "react-router-dom";

const CompanyProfilePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Mongoose Model অনুযায়ী স্টেট স্ট্রাকচার
  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    industry: "",
    size: "",
    registrationNumber: "",
    taxId: "",
    email: "",
    phone: "",
    website: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
    },
    currency: "BDT",
    timezone: "Asia/Dhaka",
    fiscalYearStartMonth: 1,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // ১. ব্যাকএন্ড থেকে বিদ্যমান প্রোফাইল ডেটা লোড করা (GET /me)
useEffect(() => {
  const fetchCompanyData = async () => {
    try {
      const response = await API.get("/company/me");
      if (response.data.success && response.data.data) {
        setFormData((prev) => ({ ...prev, ...response.data.data }));
        setCurrentStep(response.data.data.setupStep || 1);
        if (response.data.data.logoUrl) setLogoPreview(response.data.data.logoUrl);

        //console.log("Company data loaded:", response.data.data);
      }
    } catch (error) {
      console.error("Error loading company data", error);
    }
  };
  fetchCompanyData();
}, []);


  // ইনপুট হ্যান্ডলার (Nested Address সহ)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ২. ডেটা সেভ করার ফাংশন (PUT)
const saveStepData = async (nextStep = currentStep) => {
  setLoading(true);
  setMessage({ type: "", text: "" });
  try {
    const response = await API.put("/company/me", { 
      ...formData, 
      setupStep: nextStep 
    });
    
    if (response.data.success) {
      setFormData(response.data.data);
      setCurrentStep(nextStep);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Something went wrong!";
    setMessage({ type: "error", text: errorMsg });
  } finally {
    setLoading(false);
  }
};

// ৩. লোগো আপলোড হ্যান্ডলার (POST)
const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLogoPreview(URL.createObjectURL(file));

  const logoFormData = new FormData();
  logoFormData.append("logo", file);

  try {
    const response = await API.post("/company/me/logo", logoFormData, {
      headers: { "Content-Type": "multipart/form-data" }, // ফাইল আপলোডের জন্য জরুরি
    });
    
    if (response.data.success) {
      setMessage({ type: "success", text: "Logo uploaded successfully!" });
    }
  } catch (error) {
    setMessage({ type: "error", text: "Logo upload failed." });
  }
};

// ৪. লোগো ডিলিট হ্যান্ডলার (DELETE)
const handleLogoDelete = async () => {
  try {
    const response = await API.delete("/company/me/logo");
    if (response.data.success) {
      setLogoPreview("");
      setMessage({ type: "success", text: "Logo removed." });
    }
  } catch (error) {
    setMessage({ type: "error", text: "Failed to remove logo." });
  }
};

// ৫. সেটআপ কমপ্লিট করা (POST)
// যদি React Router ব্যবহার করেন, তবে ফাইলের একদম উপরে import { useNavigate } from "react-router-dom"; করে নিবেন।
// এবং কম্পোনেন্টের ভেতর const navigate = useNavigate(); ডিক্লেয়ার করবেন।

const handleFinalSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ type: "", text: "" });
  
  try {
    const response = await API.post("/company/me/complete");
    
    if (response.data.success) {
      setMessage({ type: "success", text: "Congratulations! Your company setup is complete. 🎉" });
      
      // স্টেট আপডেট করে setupCompleted ট্রু করে দেওয়া হলো
      setFormData((prev) => ({ ...prev, setupCompleted: true }));
      
      // ৩ সেকেন্ড পর ইউজারকে ড্যাশবোর্ডে রিডাইরেক্ট করবে
      setTimeout(() => {
        if (typeof Navigate === "function") {
          Navigate("/dashboard"); // আপনার ড্যাশবোর্ড রাউটের পাথ দিন
        }
      }, 3500);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Final submission failed.";
    setMessage({ type: "error", text: errorMsg });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100">
      {/* Progress Bar Indicators */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <span className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold ${currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {step}
            </span>
            <span className={`ml-2 text-sm hidden sm:inline ${currentStep === step ? "font-semibold text-blue-600" : "text-gray-500"}`}>
              {step === 1 && "Basics"}
              {step === 2 && "Contact & Address"}
              {step === 3 && "Branding"}
              {step === 4 && "Review & Complete"}
            </span>
            {step < 4 && <div className={`w-12 sm:w-20 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Alert Message Box */}
      {message.text && (
        <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      {/* STEP 1: BASICS */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Company Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Legal Name</label>
              <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Size</label>
              <select name="size" value={formData.size} onChange={handleChange} className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => saveStepData(2)} disabled={loading || !formData.name} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition">
              {loading ? "Saving..." : "Next Step"}
            </button>
          </div>
        </div>
      )}
      {/* STEP 2: CONTACT & ADDRESS */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Contact & Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input 
                type="url" 
                name="website" 
                value={formData.website || ""} 
                onChange={handleChange} 
                placeholder="https://" 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <h3 className="text-md font-semibold text-gray-700 mb-3">Physical Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input 
                type="text" 
                name="address.line1" 
                value={formData.address?.line1 || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input 
                type="text" 
                name="address.line2" 
                value={formData.address?.line2 || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input 
                type="text" 
                name="address.city" 
                value={formData.address?.city || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State / Division</label>
              <input 
                type="text" 
                name="address.state" 
                value={formData.address?.state || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input 
                type="text" 
                name="address.postalCode" 
                value={formData.address?.postalCode || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input 
                type="text" 
                name="address.country" 
                value={formData.address?.country || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button 
              type="button"
              onClick={() => setCurrentStep(1)} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Back
            </button>
            <button 
              type="button"
              onClick={() => saveStepData(3)} 
              disabled={loading} 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {loading ? "Saving..." : "Next Step"}
            </button>
          </div>
        </div>
      )}

            {/* STEP 3: BRANDING & PREFERENCES */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Step 3: Branding & Preferences</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative h-20 w-20 border rounded-lg overflow-hidden group">
                  <img 
                    /* লোকাল blob ইউআরএল অথবা ফুল http পাথ থাকলে সরাসরি দেখাবে, নয়তো localhost:5000 যুক্ত করবে */
                    src={
                      logoPreview.startsWith("blob:") || logoPreview.startsWith("http")
                        ? logoPreview
                        : `${BACKEND_URL}${logoPreview.startsWith("/") ? "" : "/"}${logoPreview}`
                    } 
                    alt="Logo Preview" 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleLogoDelete} 
                    className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  No Logo
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <input 
                type="text" 
                name="currency" 
                value={formData.currency || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input 
                type="text" 
                name="timezone" 
                value={formData.timezone || ""} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fiscal Year Start Month</label>
              <select 
                name="fiscalYearStartMonth" 
                value={formData.fiscalYearStartMonth || 1} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button 
              type="button"
              onClick={() => setCurrentStep(2)} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Back
            </button>
            <button 
              type="button"
              onClick={() => saveStepData(4)} 
              disabled={loading} 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {loading ? "Saving..." : "Next Step"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & COMPLETE */}
      {currentStep === 4 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Step 4: Review Your Details</h2>
          
          {/* প্রোফাইল প্রিভিউ কার্ড */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-3 text-sm text-gray-700 border border-gray-200">
            <div className="flex items-center gap-4 border-b pb-3 mb-3">
              {logoPreview ? (
                <img 
                  /* আপডেট: Step 4-এও ডাইনামিক ব্যাকএন্ড ইউআরএল যুক্ত করা হয়েছে */
                  src={
                    logoPreview.startsWith("blob:") || logoPreview.startsWith("http")
                      ? logoPreview
                      : `${BACKEND_URL}${logoPreview.startsWith("/") ? "" : "/"}${logoPreview}`
                  } 
                  alt="Company Logo" 
                  className="h-14 w-14 rounded-lg object-cover border" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 font-bold">No Logo</div>
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900">{formData.name}</h3>
                <p className="text-xs text-gray-500">{formData.legalName || "No Legal Name Provided"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p><strong>Industry:</strong> {formData.industry || "N/A"}</p>
              <p><strong>Company Size:</strong> {formData.size || "N/A"}</p>
              <p><strong>Registration No:</strong> {formData.registrationNumber || "N/A"}</p>
              <p><strong>Tax ID:</strong> {formData.taxId || "N/A"}</p>
              <p><strong>Email:</strong> {formData.email || "N/A"}</p>
              <p><strong>Phone:</strong> {formData.phone || "N/A"}</p>
              <p><strong>Website:</strong> {formData.website || "N/A"}</p>
              <p><strong>Currency:</strong> {formData.currency}</p>
              <p><strong>Timezone:</strong> {formData.timezone}</p>
              <p><strong>Fiscal Start Month:</strong> {formData.fiscalYearStartMonth}</p>
            </div>

            <div className="border-t pt-3 mt-3">
              <p><strong>Address:</strong> {`
                ${formData.address?.line1 || ""}, 
                ${formData.address?.line2 ? formData.address.line2 + ", " : ""} 
                ${formData.address?.city || ""}, 
                ${formData.address?.state || ""}, 
                ${formData.address?.postalCode || ""}, 
                ${formData.address?.country || ""}
              `}</p>
            </div>
          </div>

          {/* নেভিগেশন অ্যাকশন বাটনসমূহ */}
          <div className="flex justify-between mt-6">
            <button 
              type="button"
              disabled={formData.setupCompleted}
              onClick={() => setCurrentStep(3)} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button 
              type="button"
              onClick={handleFinalSubmit} 
              disabled={loading || formData.setupCompleted} 
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {formData.setupCompleted ? (
                <>
                  <span>Setup Completed</span>
                  <span>🎉</span>
                </>
              ) : loading ? (
                "Completing..."
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyProfilePage;
