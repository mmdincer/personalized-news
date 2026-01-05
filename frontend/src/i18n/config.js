import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationTR from '../locales/tr/translation.json';
import translationEN from '../locales/en/translation.json';
import translationDE from '../locales/de/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationES from '../locales/es/translation.json';

const resources = {
  tr: {
    translation: translationTR,
  },
  en: {
    translation: translationEN,
  },
  de: {
    translation: translationDE,
  },
  fr: {
    translation: translationFR,
  },
  es: {
    translation: translationES,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // Default language: Turkish
    fallbackLng: 'tr', // Fallback language if translation missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

export default i18n;

