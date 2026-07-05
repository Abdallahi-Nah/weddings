import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './locales/ar.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Determine initial language: stored pref → default ar
const storedLang = localStorage.getItem('wf_lang');
const initialLang = ['ar', 'fr', 'en'].includes(storedLang) ? storedLang : 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: initialLang,
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
  });

export default i18n;
