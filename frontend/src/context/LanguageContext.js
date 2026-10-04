import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('fintwin_language') || 'en';
  });

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('fintwin_language', langCode);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback = '') => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary if key missing in selected language
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (k, fb = '') => fb || k,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  return context;
};
