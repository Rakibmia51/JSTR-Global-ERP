import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'; // 👈 এখানে সঠিক নাম বসানো হয়েছে / Correct name fixed here
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import bnTranslation from './locales/bn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      bn: { translation: bnTranslation }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
