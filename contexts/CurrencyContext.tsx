'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  _id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency | null;
  loading: boolean;
  error: string | null;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number, fromCurrency?: string) => number;
  refreshCurrencies: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch currencies from API
  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/currencies');
      const data = await response.json();

      if (data.success) {
        setCurrencies(data.currencies);
        
        // Set default currency or first active currency
        const defaultCurrency = data.currencies.find((c: Currency) => c.isDefault && c.isActive);
        const firstActiveCurrency = data.currencies.find((c: Currency) => c.isActive);
        
        if (defaultCurrency) {
          setCurrentCurrency(defaultCurrency);
        } else if (firstActiveCurrency) {
          setCurrentCurrency(firstActiveCurrency);
        }
      } else {
        setError(data.message || 'Failed to fetch currencies');
      }
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  // Initialize currencies on mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Load saved currency from localStorage
  useEffect(() => {
    if (currencies.length > 0) {
      const savedCurrencyCode = localStorage.getItem('selectedCurrency');
      if (savedCurrencyCode) {
        const savedCurrency = currencies.find(c => c.code === savedCurrencyCode && c.isActive);
        if (savedCurrency) {
          setCurrentCurrency(savedCurrency);
        }
      }
    }
  }, [currencies]);

  // Set currency and save to localStorage
  const setCurrency = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('selectedCurrency', currency.code);
  };

  // Format price with current currency
  const formatPrice = (price: number): string => {
    if (!currentCurrency) return `${price}`;
    
    const convertedPrice = convertPrice(price);
    
    // Format based on currency
    if (currentCurrency.code === 'NPR') {
      return `${currentCurrency.symbol} ${convertedPrice.toLocaleString('en-NP', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })}`;
    } else if (currentCurrency.code === 'INR') {
      return `${currentCurrency.symbol} ${convertedPrice.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } else {
      return `${currentCurrency.symbol}${convertedPrice.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    }
  };

  // Convert price from base currency (NPR) to current currency
  const convertPrice = (price: number, fromCurrency: string = 'NPR'): number => {
    if (!currentCurrency) return price;
    
    // If converting from NPR to current currency
    if (fromCurrency === 'NPR') {
      return price * currentCurrency.exchangeRate;
    }
    
    // If converting from current currency to NPR
    if (fromCurrency === currentCurrency.code) {
      return price / currentCurrency.exchangeRate;
    }
    
    // For other conversions, first convert to NPR then to target currency
    const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
    if (fromCurrencyData) {
      const priceInNPR = price / fromCurrencyData.exchangeRate;
      return priceInNPR * currentCurrency.exchangeRate;
    }
    
    return price;
  };

  // Refresh currencies
  const refreshCurrencies = async () => {
    await fetchCurrencies();
  };

  const value: CurrencyContextType = {
    currencies,
    currentCurrency,
    loading,
    error,
    setCurrency,
    formatPrice,
    convertPrice,
    refreshCurrencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;