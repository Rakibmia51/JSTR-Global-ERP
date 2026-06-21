import  { createContext, useState, useContext } from 'react'; // ← এখানে useContext ইম্পোর্ট থাকা আবশ্যক
import { translations } from './translations'; 

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// এই ফাংশনটি নিচে হুবহু এভাবে লিখুন
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
