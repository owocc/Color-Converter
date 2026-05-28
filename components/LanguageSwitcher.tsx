import React, { useState, useRef, useEffect } from "react";
import { useTranslation, type Locale } from "../i18n/context";

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

const GlobeIcon: React.FC = () => (
  <svg
    className="w-6 h-6 text-[#49454F] dark:text-[#C8C5CA]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

interface LanguageSwitcherProps {
  isMobile: boolean;
  isDrawerOpen: boolean;
  onDrawerOpen: () => void;
  onDrawerClose: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  isMobile,
  isDrawerOpen,
  onDrawerOpen,
  onDrawerClose,
}) => {
  const { locale, setLocale } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleSelect = (value: Locale) => {
    setLocale(value);
    setIsDropdownOpen(false);
    onDrawerClose();
  };

  const handleButtonClick = () => {
    if (isMobile) {
      onDrawerOpen();
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={handleButtonClick}
          className="p-2.5 rounded-full hover:bg-[#ECE6F0] dark:hover:bg-[#36343B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#F3EDF7] dark:focus:ring-offset-[#242429] focus:ring-[#D0BCFF]"
          aria-label="Change language"
        >
          <GlobeIcon />
        </button>
        {!isMobile && isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 min-w-36 bg-[#F3EDF7] dark:bg-[#242429] border border-[#E7E0EC] dark:border-[#49454F] rounded-2xl shadow-xl z-20 p-2 flex flex-col gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleSelect(lang.value)}
                className={`px-4 py-2.5 text-sm rounded-xl text-left transition-colors ${
                  locale === lang.value
                    ? "bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1C1B1F] dark:text-[#E6E1E5]"
                    : "text-[#49454F] dark:text-[#C8C5CA] hover:bg-[#E7E0EC] dark:hover:bg-[#36343B]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 flex justify-center items-end ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-modal="true"
          role="dialog"
          aria-hidden={!isDrawerOpen}
          onClick={onDrawerClose}
          style={{ transition: "opacity 0.3s ease-in-out" }}
        >
          <div
            className={`absolute inset-0 bg-black/50 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
            style={{ transition: "opacity 0.3s ease-in-out" }}
          />
          <div
            className="bg-[#F3EDF7] dark:bg-[#2E2E33] border-t border-[#E7E0EC] dark:border-[#49454F] rounded-t-2xl w-full max-w-lg p-5 pb-8 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: isDrawerOpen ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#79747E] dark:bg-[#938F99] rounded-full" />
            <div className="flex flex-col gap-1 w-full mt-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleSelect(lang.value)}
                  className={`px-4 py-3 text-base rounded-xl text-left transition-colors ${
                    locale === lang.value
                      ? "bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1C1B1F] dark:text-[#E6E1E5]"
                      : "text-[#49454F] dark:text-[#C8C5CA] hover:bg-[#E7E0EC] dark:hover:bg-[#36343B]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSwitcher;
