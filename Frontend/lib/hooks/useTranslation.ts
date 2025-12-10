import { useLanguage } from '@/lib/providers/language-provider';
import { translations, TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { currentLanguage } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    const lang = (currentLanguage.code as keyof typeof translations) || 'en';
    return translations[lang]?.[key] || translations.en[key] || key;
  };
  
  return { t, currentLanguage };
}
