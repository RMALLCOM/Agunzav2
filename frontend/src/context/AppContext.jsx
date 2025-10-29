import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { DESTINATIONS, GATES, i18n } from "../mock/mock";

const AppContext = createContext(null);

const defaultConfig = {
  operator: "",
  gate: "A1",
  flight: "",
  destination: "SCL",
  international: false,
};

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("js_lang") || "ES");
  const [config, setConfig] = useState(() => {
    const s = localStorage.getItem("js_config");
    return s ? JSON.parse(s) : defaultConfig;
  });
  const [scan, setScan] = useState({
    dataUrl: null, // captured image (mock)
    results: null, // mocked evaluation results
  });
  const t = i18n[lang] || i18n.ES;

  useEffect(() => {
    localStorage.setItem("js_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("js_config", JSON.stringify(config));
  }, [config]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      config,
      setConfig,
      scan,
      setScan,
      DESTINATIONS,
      GATES,
    }),
    [lang, t, config, scan]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
