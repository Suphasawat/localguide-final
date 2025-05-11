"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../context/LocaleContext";

interface LanguageCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageCurrencyModal({
  isOpen,
  onClose,
}: LanguageCurrencyModalProps) {
  const [activeTab, setActiveTab] = useState<"language" | "currency">(
    "language"
  );
  const {
    language,
    currency,
    translationEnabled,
    setLanguage,
    setCurrency,
    setTranslationEnabled,
  } = useLocale();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-lg shadow-xl"
      >
        {/* Modal Header with Close Button */}
        <div className="p-4 border-b flex items-center">
          <button onClick={onClose} className="mr-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Tabs */}
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("language")}
              className={`py-2 font-medium ${
                activeTab === "language"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Language and region
            </button>
            <button
              onClick={() => setActiveTab("currency")}
              className={`py-2 font-medium ${
                activeTab === "currency"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Currency
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeTab === "language" && (
            <>
              {/* Translation Toggle */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Translation</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Automatically translate descriptions and reviews to
                      English.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    className={`w-12 h-6 flex items-center rounded-full p-1 ${
                      translationEnabled
                        ? "bg-black justify-end"
                        : "bg-gray-300 justify-start"
                    }`}
                    onClick={() => setTranslationEnabled(!translationEnabled)}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <h3 className="font-medium text-xl mb-4">
                Choose a language and region
              </h3>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {/* Thai Option */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer hover:border-gray-900 ${
                    language === "th" ? "border-gray-900" : "border-gray-300"
                  }`}
                  onClick={() => setLanguage("th")}
                >
                  <div className="font-medium">ไทย</div>
                  <div className="text-gray-600">ประเทศไทย</div>
                </div>

                {/* English Option */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer hover:border-gray-900 ${
                    language === "en" ? "border-gray-900" : "border-gray-300"
                  }`}
                  onClick={() => setLanguage("en")}
                >
                  <div className="font-medium">English</div>
                  <div className="text-gray-600">United States</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "currency" && (
            <>
              <h3 className="font-medium text-xl mb-4">Choose a currency</h3>

              <div className="grid grid-cols-1 gap-2">
                {/* THB Option */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer hover:border-gray-900 ${
                    currency === "THB" ? "border-gray-900" : "border-gray-300"
                  }`}
                  onClick={() => setCurrency("THB")}
                >
                  <div className="font-medium">THB - ฿</div>
                  <div className="text-gray-600">Thai Baht</div>
                </div>

                {/* USD Option */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer hover:border-gray-900 ${
                    currency === "USD" ? "border-gray-900" : "border-gray-300"
                  }`}
                  onClick={() => setCurrency("USD")}
                >
                  <div className="font-medium">USD - $</div>
                  <div className="text-gray-600">US Dollar</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
