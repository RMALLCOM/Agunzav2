import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { HomePage, ConfigPage, ScanPage, DetailPage, PaymentPage } from "./pages/pages";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/detail" element={<DetailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
