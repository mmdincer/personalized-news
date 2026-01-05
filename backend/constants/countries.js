/**
 * Supported countries and languages constants
 * Maps country codes to language codes for i18n
 */

// Supported countries configuration
const SUPPORTED_COUNTRIES = [
  {
    code: 'tr',
    name: 'Turkey',
    language: 'tr',
    languageName: 'Türkçe',
    flag: '🇹🇷',
    default: true, // Default country/language
  },
  {
    code: 'us',
    name: 'United States',
    language: 'en',
    languageName: 'English',
    flag: '🇺🇸',
    default: false,
  },
  {
    code: 'de',
    name: 'Germany',
    language: 'de',
    languageName: 'Deutsch',
    flag: '🇩🇪',
    default: false,
  },
  {
    code: 'fr',
    name: 'France',
    language: 'fr',
    languageName: 'Français',
    flag: '🇫🇷',
    default: false,
  },
  {
    code: 'es',
    name: 'Spain',
    language: 'es',
    languageName: 'Español',
    flag: '🇪🇸',
    default: false,
  },
];

// Default country code
const DEFAULT_COUNTRY = 'tr';

// Country codes array (for validation)
const COUNTRY_CODES = SUPPORTED_COUNTRIES.map((country) => country.code);

// Language codes array
const LANGUAGE_CODES = SUPPORTED_COUNTRIES.map((country) => country.language);

/**
 * Country to language mapping
 * Maps country code to language code
 */
const COUNTRY_TO_LANGUAGE = SUPPORTED_COUNTRIES.reduce((acc, country) => {
  acc[country.code] = country.language;
  return acc;
}, {});

/**
 * Language to country mapping (first match)
 * Maps language code to country code
 */
const LANGUAGE_TO_COUNTRY = SUPPORTED_COUNTRIES.reduce((acc, country) => {
  if (!acc[country.language]) {
    acc[country.language] = country.code;
  }
  return acc;
}, {});

/**
 * Validate if a country code is supported
 * @param {string} countryCode - Country code to validate
 * @returns {boolean} True if country is valid, false otherwise
 */
const isValidCountry = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return false;
  }
  return COUNTRY_CODES.includes(countryCode.toLowerCase());
};

/**
 * Get language code for a country code
 * @param {string} countryCode - Country code
 * @returns {string|null} Language code or null if country not found
 */
const getLanguageForCountry = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return null;
  }
  return COUNTRY_TO_LANGUAGE[countryCode.toLowerCase()] || null;
};

/**
 * Get country information by country code
 * @param {string} countryCode - Country code
 * @returns {Object|null} Country object or null if not found
 */
const getCountryInfo = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return null;
  }
  return (
    SUPPORTED_COUNTRIES.find(
      (country) => country.code.toLowerCase() === countryCode.toLowerCase()
    ) || null
  );
};

/**
 * Get default country code
 * @returns {string} Default country code
 */
const getDefaultCountry = () => {
  return DEFAULT_COUNTRY;
};

/**
 * Get default country info
 * @returns {Object} Default country object
 */
const getDefaultCountryInfo = () => {
  return getCountryInfo(DEFAULT_COUNTRY);
};

/**
 * Get all supported countries
 * @returns {Array<Object>} Array of country objects
 */
const getAllCountries = () => {
  return SUPPORTED_COUNTRIES;
};

/**
 * Get all country codes
 * @returns {Array<string>} Array of country codes
 */
const getAllCountryCodes = () => {
  return COUNTRY_CODES;
};

/**
 * Get all language codes
 * @returns {Array<string>} Array of language codes
 */
const getAllLanguageCodes = () => {
  return LANGUAGE_CODES;
};

module.exports = {
  SUPPORTED_COUNTRIES,
  DEFAULT_COUNTRY,
  COUNTRY_CODES,
  LANGUAGE_CODES,
  COUNTRY_TO_LANGUAGE,
  LANGUAGE_TO_COUNTRY,
  isValidCountry,
  getLanguageForCountry,
  getCountryInfo,
  getDefaultCountry,
  getDefaultCountryInfo,
  getAllCountries,
  getAllCountryCodes,
  getAllLanguageCodes,
};

