import React, { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { useTranslation } from "react-i18next";

interface LocationSelectorProps {
  onSelectCountry?: (country: string) => void;
  onSelectState?: (state: string) => void;
  onSelectCity?: (city: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onSelectCountry, 
  onSelectState, 
  onSelectCity 
}) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    const fetchCountries = async () => {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
    };
    
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);
      setSelectedState('');
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      setSelectedCity('');
    }
  }, [selectedCountry, selectedState]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    if (onSelectCountry) onSelectCountry(value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedState(value);
    if (onSelectState) onSelectState(value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCity(value);
    if (onSelectCity) onSelectCity(value);
  };

  return (
    <div className="w-full flex flex-col gap-4">      
      <div className="w-full">
        <label htmlFor="country" className="block text-sm font-semibold mb-2 font-sans">
          {t("Country:")}
        </label>
        <select 
          id="country" 
          value={selectedCountry} 
          onChange={handleCountryChange}
          className="w-full px-4 py-3 border-2 border-black rounded-lg transition-all duration-200 font-sans"
        >
          <option value="">{t("Select Country")}</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full">
        <label htmlFor="state" className="block text-sm font-semibold mb-2 font-sans">
          {t("State/Province:")}
        </label>
        <select 
          id="state" 
          value={selectedState} 
          onChange={handleStateChange} 
          disabled={!selectedCountry}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 font-sans ${
            !selectedCountry 
              ? "border-gray-300 bg-gray-100 cursor-not-allowed text-gray-400" 
              : "border-black"
          }`}
        >
          <option value="">{t("Select State")}</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full">
        <label htmlFor="city" className="block text-sm font-semibold mb-2 font-sans">
          {t("City:")}
        </label>
        <select 
          id="city" 
          value={selectedCity} 
          onChange={handleCityChange} 
          disabled={!selectedState}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 font-sans ${
            !selectedState 
              ? "border-gray-300 bg-gray-100 cursor-not-allowed text-gray-400" 
              : "border-black"
          }`}
        >
          <option value="">{t("Select City")}</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && selectedState && selectedCity && (
        <div className="w-full mt-2 p-4 bg-[#Adff2f] border-2 border-black rounded-2xl">
          <p className="font-sans text-center">
            {t("Selected Location")}: {
              `${cities.find(c => c.name === selectedCity)?.name || ''}, 
               ${states.find(s => s.isoCode === selectedState)?.name || ''}, 
               ${countries.find(c => c.isoCode === selectedCountry)?.name || ''}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;