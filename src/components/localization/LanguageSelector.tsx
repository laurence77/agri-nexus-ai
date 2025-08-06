import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLocalization, SUPPORTED_LOCALES, LocaleConfig } from '@/lib/localization';

interface LanguageSelectorProps {
  className?: string;
  showFlags?: boolean;
  showRegion?: boolean;
  compact?: boolean;
}

export default function LanguageSelector({ 
  className = '', 
  showFlags = true, 
  showRegion = true,
  compact = false 
}: LanguageSelectorProps) {
  const { locale, changeLocale, loading } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = async (localeCode: string) => {
    setIsOpen(false);
    if (localeCode !== locale.code) {
      await changeLocale(localeCode);
    }
  };

  const groupedLocales = Object.values(SUPPORTED_LOCALES).reduce((acc, localeConfig) => {
    if (!acc[localeConfig.region]) {
      acc[localeConfig.region] = [];
    }
    acc[localeConfig.region].push(localeConfig);
    return acc;
  }, {} as Record<string, LocaleConfig[]>);

  // Sort regions and locales within each region
  const sortedRegions = Object.keys(groupedLocales).sort();
  sortedRegions.forEach(region => {
    groupedLocales[region].sort((a, b) => a.name.localeCompare(b.name));
  });

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {showFlags && (
            <span className="text-lg" role="img" aria-label={locale.name}>
              🌐
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {locale.code.split('-')[0].toUpperCase()}
          </span>
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="py-2">
              {sortedRegions.map(region => (
                <div key={region}>
                  {showRegion && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {region}
                    </div>
                  )}
                  {groupedLocales[region].map(localeConfig => (
                    <button
                      key={localeConfig.code}
                      onClick={() => handleLocaleChange(localeConfig.code)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 ${
                        locale.code === localeConfig.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {showFlags && localeConfig.code === 'en-US' && <span className="text-lg">🇺🇸</span>}
                      {showFlags && localeConfig.code === 'en-GB' && <span className="text-lg">🇬🇧</span>}
                      {showFlags && localeConfig.code === 'es-ES' && <span className="text-lg">🇪🇸</span>}
                      {showFlags && localeConfig.code === 'es-MX' && <span className="text-lg">🇲🇽</span>}
                      {showFlags && localeConfig.code === 'pt-BR' && <span className="text-lg">🇧🇷</span>}
                      {showFlags && localeConfig.code === 'fr-FR' && <span className="text-lg">🇫🇷</span>}
                      {showFlags && localeConfig.code === 'de-DE' && <span className="text-lg">🇩🇪</span>}
                      {showFlags && localeConfig.code === 'zh-CN' && <span className="text-lg">🇨🇳</span>}
                      {showFlags && localeConfig.code === 'hi-IN' && <span className="text-lg">🇮🇳</span>}
                      {showFlags && localeConfig.code === 'ar-SA' && <span className="text-lg">🇸🇦</span>}
                      {showFlags && localeConfig.code === 'ja-JP' && <span className="text-lg">🇯🇵</span>}
                      {showFlags && localeConfig.code === 'ko-KR' && <span className="text-lg">🇰🇷</span>}
                      <div>
                        <div className="font-medium">{localeConfig.nativeName}</div>
                        <div className="text-sm text-gray-500">{localeConfig.name}</div>
                      </div>
                      {locale.code === localeConfig.code && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
      >
        {showFlags && (
          <span className="text-2xl" role="img" aria-label={locale.name}>
            {locale.code === 'en-US' && '🇺🇸'}
            {locale.code === 'en-GB' && '🇬🇧'}
            {locale.code === 'es-ES' && '🇪🇸'}
            {locale.code === 'es-MX' && '🇲🇽'}
            {locale.code === 'pt-BR' && '🇧🇷'}
            {locale.code === 'fr-FR' && '🇫🇷'}
            {locale.code === 'de-DE' && '🇩🇪'}
            {locale.code === 'zh-CN' && '🇨🇳'}
            {locale.code === 'hi-IN' && '🇮🇳'}
            {locale.code === 'ar-SA' && '🇸🇦'}
            {locale.code === 'ja-JP' && '🇯🇵'}
            {locale.code === 'ko-KR' && '🇰🇷'}
            {!['en-US', 'en-GB', 'es-ES', 'es-MX', 'pt-BR', 'fr-FR', 'de-DE', 'zh-CN', 'hi-IN', 'ar-SA', 'ja-JP', 'ko-KR'].includes(locale.code) && '🌐'}
          </span>
        )}
        
        <div className="text-left">
          <div className="font-medium text-gray-900">{locale.nativeName}</div>
          {showRegion && (
            <div className="text-sm text-gray-500">{locale.region} • {locale.currency}</div>
          )}
        </div>

        {loading ? (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ChevronDownIcon className={`ml-auto w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Choose Language & Region</h3>
            </div>
          </div>

          <div className="py-2">
            {sortedRegions.map(region => (
              <div key={region}>
                {showRegion && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                    {region}
                  </div>
                )}
                {groupedLocales[region].map(localeConfig => (
                  <button
                    key={localeConfig.code}
                    onClick={() => handleLocaleChange(localeConfig.code)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                      locale.code === localeConfig.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {showFlags && (
                      <span className="text-xl" role="img" aria-label={localeConfig.name}>
                        {localeConfig.code === 'en-US' && '🇺🇸'}
                        {localeConfig.code === 'en-GB' && '🇬🇧'}
                        {localeConfig.code === 'es-ES' && '🇪🇸'}
                        {localeConfig.code === 'es-MX' && '🇲🇽'}
                        {localeConfig.code === 'pt-BR' && '🇧🇷'}
                        {localeConfig.code === 'fr-FR' && '🇫🇷'}
                        {localeConfig.code === 'de-DE' && '🇩🇪'}
                        {localeConfig.code === 'zh-CN' && '🇨🇳'}
                        {localeConfig.code === 'hi-IN' && '🇮🇳'}
                        {localeConfig.code === 'ar-SA' && '🇸🇦'}
                        {localeConfig.code === 'ja-JP' && '🇯🇵'}
                        {localeConfig.code === 'ko-KR' && '🇰🇷'}
                        {!['en-US', 'en-GB', 'es-ES', 'es-MX', 'pt-BR', 'fr-FR', 'de-DE', 'zh-CN', 'hi-IN', 'ar-SA', 'ja-JP', 'ko-KR'].includes(localeConfig.code) && '🌐'}
                      </span>
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium">{localeConfig.nativeName}</div>
                      <div className="text-sm text-gray-500">
                        {localeConfig.name} • {localeConfig.currency}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase">
                        {localeConfig.units.temperature} • {localeConfig.units.area}
                      </div>
                      {locale.code === localeConfig.code && (
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Current format: {locale.dateFormat} • {locale.timeFormat === '12h' ? '12-hour' : '24-hour'} • {locale.numberFormat.decimal === ',' ? 'European' : 'US'} numbers
            </div>
          </div>
        </div>
      )}
    </div>
  );
}