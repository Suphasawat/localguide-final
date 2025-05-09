"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "th" | "en";
type Currency = "THB" | "USD";

interface LocaleContextType {
  language: Language;
  currency: Currency;
  translationEnabled: boolean;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setTranslationEnabled: (enabled: boolean) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("th");
  const [currency, setCurrency] = useState<Currency>("THB");
  const [translationEnabled, setTranslationEnabled] = useState(true);

  const value = {
    language,
    currency,
    translationEnabled,
    setLanguage,
    setCurrency,
    setTranslationEnabled,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: Currency) {
  if (currency === "THB") {
    return `฿${amount.toLocaleString()}`;
  } else {
    return `$${(amount / 35).toFixed(2)}`;
  }
}
