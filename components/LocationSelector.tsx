import React, { useState, useEffect } from 'react';
import { Country } from 'country-state-city';
import { useTranslation } from "react-i18next";

interface CountrySelectorProps {
  onSelectCountry?: (country: string) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  onSelectCountry 
}) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    const fetchCountries = async () => {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
    };
    
    fetchCountries();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isoCode = e.target.value;
    const country = countries.find(c => c.isoCode === isoCode);
    if (country) {
      setSelectedCountry(isoCode);
      if (onSelectCountry) onSelectCountry(country.name);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="country" className="block text-sm font-medium mb-2">
        {t("Country")}
      </label>
      <select 
        id="country" 
        value={selectedCountry} 
        onChange={handleCountryChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{t("Select Country")}</option>
        {countries.map((country) => (
          <option key={country.isoCode} value={country.isoCode}>
            {country.name}
          </option>
        ))}
      </select>

      {selectedCountry && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-center">
            {t("Selected Country")}: {
              countries.find(c => c.isoCode === selectedCountry)?.name || ''
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;