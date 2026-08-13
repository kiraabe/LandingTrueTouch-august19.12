import { useEffect, useState } from "react";

export default function useLanguage() {
  const [language, setLanguage] = useState(() => document.documentElement.lang || "en");

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  return language;
}
