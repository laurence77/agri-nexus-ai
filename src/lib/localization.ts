import { useState, useEffect } from 'react';

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
  };
  units: {
    area: 'hectares' | 'acres' | 'square_meters';
    weight: 'kg' | 'lbs' | 'tons';
    temperature: 'celsius' | 'fahrenheit';
    distance: 'km' | 'miles';
    volume: 'liters' | 'gallons';
  };
  rtl: boolean;
}

export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  'en-US': {
    code: 'en-US',
    name: 'English (United States)',
    nativeName: 'English',
    region: 'North America',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'acres',
      weight: 'lbs',
      temperature: 'fahrenheit',
      distance: 'miles',
      volume: 'gallons'
    },
    rtl: false
  },
  'en-GB': {
    code: 'en-GB',
    name: 'English (United Kingdom)',
    nativeName: 'English',
    region: 'Europe',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'es-MX': {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español',
    region: 'North America',
    currency: 'MXN',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    region: 'South America',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français',
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'de-DE': {
    code: 'de-DE',
    name: 'German (Germany)',
    nativeName: 'Deutsch',
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    region: 'Asia',
    currency: 'CNY',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi (India)',
    nativeName: 'हिन्दी',
    region: 'Asia',
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    region: 'Middle East',
    currency: 'SAR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: true
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese (Japan)',
    nativeName: '日本語',
    region: 'Asia',
    currency: 'JPY',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 0
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean (South Korea)',
    nativeName: '한국어',
    region: 'Asia',
    currency: 'KRW',
    dateFormat: 'yyyy. MM. dd.',
    timeFormat: '24h',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 0
    },
    units: {
      area: 'hectares',
      weight: 'kg',
      temperature: 'celsius',
      distance: 'km',
      volume: 'liters'
    },
    rtl: false
  }
};

export const AGRICULTURAL_REGIONS = {
  'North America': ['en-US', 'es-MX', 'fr-CA'],
  'South America': ['pt-BR', 'es-AR', 'es-CO'],
  'Europe': ['en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'nl-NL'],
  'Asia': ['zh-CN', 'hi-IN', 'ja-JP', 'ko-KR', 'th-TH', 'vi-VN'],
  'Middle East': ['ar-SA', 'ar-EG', 'he-IL', 'tr-TR'],
  'Africa': ['en-ZA', 'fr-MA', 'ar-EG', 'sw-KE'],
  'Oceania': ['en-AU', 'en-NZ']
};

export class LocalizationService {
  private static currentLocale: LocaleConfig = SUPPORTED_LOCALES['en-US'];
  private static translations: Record<string, Record<string, string>> = {};
  private static loadedLanguages = new Set<string>();

  static getCurrentLocale(): LocaleConfig {
    return this.currentLocale;
  }

  static async setLocale(localeCode: string): Promise<void> {
    if (SUPPORTED_LOCALES[localeCode]) {
      this.currentLocale = SUPPORTED_LOCALES[localeCode];
      
      // Load translations if not already loaded
      if (!this.loadedLanguages.has(localeCode)) {
        await this.loadTranslations(localeCode);
      }

      // Update document direction for RTL languages
      if (typeof document !== 'undefined') {
        document.documentElement.dir = this.currentLocale.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = localeCode;
      }

      // Store user preference
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('agri-nexus-locale', localeCode);
      }
    } else {
      throw new Error(`Unsupported locale: ${localeCode}`);
    }
  }

  static async loadTranslations(localeCode: string): Promise<void> {
    try {
      // In a real implementation, this would fetch from a CDN or API
      // For now, we'll simulate with some basic agricultural translations
      const mockTranslations = await this.getMockTranslations(localeCode);
      this.translations[localeCode] = mockTranslations;
      this.loadedLanguages.add(localeCode);
    } catch (error) {
      console.error(`Failed to load translations for ${localeCode}:`, error);
      throw error;
    }
  }

  private static async getMockTranslations(localeCode: string): Promise<Record<string, string>> {
    // Mock translation data - in production this would be loaded from translation files
    const translations: Record<string, Record<string, string>> = {
      'es-ES': {
        'dashboard': 'Panel de Control',
        'farm': 'Granja',
        'crops': 'Cultivos',
        'livestock': 'Ganado',
        'financial_records': 'Registros Financieros',
        'weather': 'Clima',
        'yield': 'Rendimiento',
        'planting_date': 'Fecha de Siembra',
        'harvest_date': 'Fecha de Cosecha',
        'save': 'Guardar',
        'cancel': 'Cancelar',
        'delete': 'Eliminar',
        'edit': 'Editar',
        'add_new': 'Agregar Nuevo',
        'settings': 'Configuración',
        'profile': 'Perfil',
        'logout': 'Cerrar Sesión'
      },
      'pt-BR': {
        'dashboard': 'Painel de Controle',
        'farm': 'Fazenda',
        'crops': 'Culturas',
        'livestock': 'Gado',
        'financial_records': 'Registros Financeiros',
        'weather': 'Clima',
        'yield': 'Produtividade',
        'planting_date': 'Data de Plantio',
        'harvest_date': 'Data de Colheita',
        'save': 'Salvar',
        'cancel': 'Cancelar',
        'delete': 'Excluir',
        'edit': 'Editar',
        'add_new': 'Adicionar Novo',
        'settings': 'Configurações',
        'profile': 'Perfil',
        'logout': 'Sair'
      },
      'fr-FR': {
        'dashboard': 'Tableau de Bord',
        'farm': 'Ferme',
        'crops': 'Cultures',
        'livestock': 'Bétail',
        'financial_records': 'Registres Financiers',
        'weather': 'Météo',
        'yield': 'Rendement',
        'planting_date': 'Date de Plantation',
        'harvest_date': 'Date de Récolte',
        'save': 'Sauvegarder',
        'cancel': 'Annuler',
        'delete': 'Supprimer',
        'edit': 'Modifier',
        'add_new': 'Ajouter Nouveau',
        'settings': 'Paramètres',
        'profile': 'Profil',
        'logout': 'Se Déconnecter'
      },
      'zh-CN': {
        'dashboard': '仪表板',
        'farm': '农场',
        'crops': '作物',
        'livestock': '牲畜',
        'financial_records': '财务记录',
        'weather': '天气',
        'yield': '产量',
        'planting_date': '种植日期',
        'harvest_date': '收获日期',
        'save': '保存',
        'cancel': '取消',
        'delete': '删除',
        'edit': '编辑',
        'add_new': '添加新的',
        'settings': '设置',
        'profile': '个人资料',
        'logout': '退出'
      },
      'ar-SA': {
        'dashboard': 'لوحة القيادة',
        'farm': 'مزرعة',
        'crops': 'المحاصيل',
        'livestock': 'الماشية',
        'financial_records': 'السجلات المالية',
        'weather': 'الطقس',
        'yield': 'الإنتاجية',
        'planting_date': 'تاريخ الزراعة',
        'harvest_date': 'تاريخ الحصاد',
        'save': 'حفظ',
        'cancel': 'إلغاء',
        'delete': 'حذف',
        'edit': 'تعديل',
        'add_new': 'إضافة جديد',
        'settings': 'الإعدادات',
        'profile': 'الملف الشخصي',
        'logout': 'تسجيل خروج'
      },
      'hi-IN': {
        'dashboard': 'डैशबोर्ड',
        'farm': 'खेत',
        'crops': 'फसलें',
        'livestock': 'पशुधन',
        'financial_records': 'वित्तीय रिकॉर्ड',
        'weather': 'मौसम',
        'yield': 'उत्पादन',
        'planting_date': 'बुआई की तारीख',
        'harvest_date': 'कटाई की तारीख',
        'save': 'सहेजें',
        'cancel': 'रद्द करें',
        'delete': 'हटाएं',
        'edit': 'संपादित करें',
        'add_new': 'नया जोड़ें',
        'settings': 'सेटिंग्स',
        'profile': 'प्रोफाइल',
        'logout': 'लॉगआउट'
      }
    };

    return translations[localeCode] || {};
  }

  static translate(key: string, fallback?: string): string {
    const localeCode = this.currentLocale.code;
    const translation = this.translations[localeCode]?.[key];
    return translation || fallback || key;
  }

  static formatNumber(value: number): string {
    const { decimal, thousands, precision } = this.currentLocale.numberFormat;
    
    return value.toFixed(precision)
      .replace('.', decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  }

  static formatCurrency(value: number): string {
    const { currency } = this.currentLocale;
    
    try {
      return new Intl.NumberFormat(this.currentLocale.code, {
        style: 'currency',
        currency: currency
      }).format(value);
    } catch (error) {
      return `${currency} ${this.formatNumber(value)}`;
    }
  }

  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(this.currentLocale.code, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(dateObj);
    } catch (error) {
      return dateObj.toLocaleDateString();
    }
  }

  static formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const use24Hour = this.currentLocale.timeFormat === '24h';
    
    try {
      return new Intl.DateTimeFormat(this.currentLocale.code, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !use24Hour
      }).format(dateObj);
    } catch (error) {
      return dateObj.toLocaleTimeString();
    }
  }

  static formatUnit(value: number, unitType: keyof LocaleConfig['units']): string {
    const unit = this.currentLocale.units[unitType];
    const formattedValue = this.formatNumber(value);
    
    const unitLabels: Record<string, string> = {
      // Area
      'hectares': 'ha',
      'acres': 'ac',
      'square_meters': 'm²',
      // Weight
      'kg': 'kg',
      'lbs': 'lbs',
      'tons': 't',
      // Temperature
      'celsius': '°C',
      'fahrenheit': '°F',
      // Distance
      'km': 'km',
      'miles': 'mi',
      // Volume
      'liters': 'L',
      'gallons': 'gal'
    };

    return `${formattedValue} ${unitLabels[unit] || unit}`;
  }

  static convertTemperature(value: number, fromUnit: 'celsius' | 'fahrenheit', toUnit?: 'celsius' | 'fahrenheit'): number {
    const targetUnit = toUnit || this.currentLocale.units.temperature;
    
    if (fromUnit === targetUnit) return value;
    
    if (fromUnit === 'celsius' && targetUnit === 'fahrenheit') {
      return (value * 9/5) + 32;
    } else if (fromUnit === 'fahrenheit' && targetUnit === 'celsius') {
      return (value - 32) * 5/9;
    }
    
    return value;
  }

  static convertArea(value: number, fromUnit: 'hectares' | 'acres' | 'square_meters', toUnit?: 'hectares' | 'acres' | 'square_meters'): number {
    const targetUnit = toUnit || this.currentLocale.units.area;
    
    if (fromUnit === targetUnit) return value;
    
    // Convert to square meters first
    let sqMeters = value;
    if (fromUnit === 'hectares') sqMeters = value * 10000;
    else if (fromUnit === 'acres') sqMeters = value * 4046.86;
    
    // Convert from square meters to target unit
    if (targetUnit === 'hectares') return sqMeters / 10000;
    else if (targetUnit === 'acres') return sqMeters / 4046.86;
    else return sqMeters;
  }

  static convertWeight(value: number, fromUnit: 'kg' | 'lbs' | 'tons', toUnit?: 'kg' | 'lbs' | 'tons'): number {
    const targetUnit = toUnit || this.currentLocale.units.weight;
    
    if (fromUnit === targetUnit) return value;
    
    // Convert to kg first
    let kg = value;
    if (fromUnit === 'lbs') kg = value * 0.453592;
    else if (fromUnit === 'tons') kg = value * 1000;
    
    // Convert from kg to target unit
    if (targetUnit === 'lbs') return kg / 0.453592;
    else if (targetUnit === 'tons') return kg / 1000;
    else return kg;
  }

  static getRegionalSettings(localeCode: string): {
    growingSeasons: string[];
    commonCrops: string[];
    weatherPatterns: string[];
    regulations: string[];
  } {
    // Regional agricultural data
    const regionalData: Record<string, any> = {
      'en-US': {
        growingSeasons: ['Spring', 'Summer', 'Fall'],
        commonCrops: ['Corn', 'Soybeans', 'Wheat', 'Cotton'],
        weatherPatterns: ['Tornado Season', 'Hurricane Season', 'Winter Freeze'],
        regulations: ['USDA Organic', 'EPA Pesticide Regulations', 'FDA Food Safety']
      },
      'pt-BR': {
        growingSeasons: ['Verão', 'Inverno', 'Safra', 'Safrinha'],
        commonCrops: ['Soja', 'Milho', 'Café', 'Cana-de-açúcar'],
        weatherPatterns: ['Estação Seca', 'Estação Chuvosa', 'El Niño', 'La Niña'],
        regulations: ['MAPA Organic', 'ANVISA Pesticides', 'INCRA Land Use']
      },
      'es-ES': {
        growingSeasons: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
        commonCrops: ['Olivos', 'Trigo', 'Cebada', 'Girasol'],
        weatherPatterns: ['Sequía', 'Lluvias Torrenciales', 'Olas de Calor'],
        regulations: ['EU Organic', 'PAC Subsidies', 'Nitrates Directive']
      }
    };

    return regionalData[localeCode] || regionalData['en-US'];
  }

  static initializeFromBrowser(): void {
    // Try to get locale from localStorage first
    const savedLocale = typeof localStorage !== 'undefined' ? 
      localStorage.getItem('agri-nexus-locale') : null;
    
    if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
      this.setLocale(savedLocale);
      return;
    }

    // Fallback to browser language
    const browserLanguage = typeof navigator !== 'undefined' ? 
      navigator.language || (navigator as any).userLanguage : 'en-US';
    
    // Try exact match first
    if (SUPPORTED_LOCALES[browserLanguage]) {
      this.setLocale(browserLanguage);
      return;
    }

    // Try language code only (e.g., 'en' from 'en-US')
    const languageCode = browserLanguage.split('-')[0];
    const matchingLocale = Object.keys(SUPPORTED_LOCALES).find(
      locale => locale.startsWith(languageCode)
    );

    if (matchingLocale) {
      this.setLocale(matchingLocale);
    } else {
      this.setLocale('en-US'); // Default fallback
    }
  }
}

// React hook for localization
export function useLocalization() {
  const [locale, setLocale] = useState<LocaleConfig>(LocalizationService.getCurrentLocale());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize on component mount
    LocalizationService.initializeFromBrowser();
    setLocale(LocalizationService.getCurrentLocale());
  }, []);

  const changeLocale = async (localeCode: string) => {
    setLoading(true);
    try {
      await LocalizationService.setLocale(localeCode);
      setLocale(LocalizationService.getCurrentLocale());
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, fallback?: string) => 
    LocalizationService.translate(key, fallback);

  const formatNumber = (value: number) => 
    LocalizationService.formatNumber(value);

  const formatCurrency = (value: number) => 
    LocalizationService.formatCurrency(value);

  const formatDate = (date: Date | string) => 
    LocalizationService.formatDate(date);

  const formatTime = (date: Date | string) => 
    LocalizationService.formatTime(date);

  const formatUnit = (value: number, unitType: keyof LocaleConfig['units']) =>
    LocalizationService.formatUnit(value, unitType);

  return {
    locale,
    loading,
    changeLocale,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatUnit,
    supportedLocales: SUPPORTED_LOCALES,
    regionalSettings: LocalizationService.getRegionalSettings(locale.code)
  };
}