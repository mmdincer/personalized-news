// i18n initialization
import './config';

// Re-export i18n instance and hooks for convenience
export { default as i18n } from './config';
export { useTranslation, Trans } from 'react-i18next';
