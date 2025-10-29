import React, { useEffect, useRef, useState } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { CheckCircle2, CircleAlert, Languages, Camera, Download } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Traducciones completas
const stringsDict = {
  es: {
    welcome: "Bienvenido",
    start: "INICIAR", 
    jetsmartTitle: "JetSMART",
    configurator: "Configurador de vuelos",
    operator: "Operador",
    gate: "Puerta de embarque",
    flightNumber: "Nº de vuelo",
    destination: "Destino",
    international: "Internacional",
    save: "GUARDAR",
    back: "VOLVER",
    startScan: "COMENZAR ESCANEO",
    scan: "ESCANEAR",
    scanTitle: "Escaneo",
    measurements: "Mediciones",
    width: "Ancho",
    length: "Largo", 
    weight: "Peso",
    calibration: "Calibración",
    ok: "OK",
    notCompliant: "No cumple",
    whyNotCompliant: "¿POR QUÉ NO CUMPLE?",
    continueToPay: "CONTINUAR AL PAGO",
    nonComplianceDetail: "Detalle de no cumplimiento",
    bagClass: "Clase: maleta",
    realDimensions: "Dimensiones reales",
    activeRules: "Reglas activas",
    exceedReasons: "Razones de exceso",
    goToTariffs: "IR A TARIFAS/PAGO",
    tariffsTitle: "Tarifas y Pago",
    excessWeight: "Exceso por peso",
    excessDimensions: "Exceso por dimensiones", 
    totalUSD: "Total USD",
    card: "TARJETA",
    qr: "QR",
    pay: "PAGAR",
    paymentApproved: "Pago aprobado ✅",
    finish: "FINALIZAR",
    madeWithEmergent: "Made with Emergent",
    kg: "kg",
    cm: "cm",
    captureSuccess: "Imagen capturada correctamente"
  },
  en: {
    welcome: "Welcome",
    start: "START",
    jetsmartTitle: "JetSMART", 
    configurator: "Flight configurator",
    operator: "Operator",
    gate: "Boarding gate",
    flightNumber: "Flight number",
    destination: "Destination",
    international: "International",
    save: "SAVE",
    back: "BACK",
    startScan: "START SCAN",
    scan: "SCAN",
    scanTitle: "Scan",
    measurements: "Measurements",
    width: "Width",
    length: "Length",
    weight: "Weight", 
    calibration: "Calibration",
    ok: "OK",
    notCompliant: "Not compliant",
    whyNotCompliant: "WHY NOT COMPLIANT?",
    continueToPay: "CONTINUE TO PAY",
    nonComplianceDetail: "Non-compliance detail",
    bagClass: "Class: suitcase",
    realDimensions: "Real dimensions",
    activeRules: "Active rules",
    exceedReasons: "Excess reasons",
    goToTariffs: "GO TO RATES/PAYMENT",
    tariffsTitle: "Rates & Payment",
    excessWeight: "Excess weight",
    excessDimensions: "Excess dimensions",
    totalUSD: "Total USD", 
    card: "CARD",
    qr: "QR",
    pay: "PAY",
    paymentApproved: "Payment approved ✅",
    finish: "FINISH", 
    madeWithEmergent: "Made with Emergent",
    kg: "kg", 
    cm: "cm",
    captureSuccess: "Image captured successfully"
  }
};

// Weight Demo Dialog
function WeightDemoDialog({ open, onClose, onSetWeight, kiosk }) {
  const [currentWeight, setCurrentWeight] = useState(0.0);
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
    if (open) {
      setCurrentWeight(0.0);
    }
  }, [open]);

  const readWeight = () => {
    // Generate random weight between 0.0 and 35.0 kg with 1 decimal
    const weight = Math.round(Math.random() * 350) / 10;
    setCurrentWeight(weight);
  };

  const setWeight = () => {
    if (currentWeight > 0) {
      onSetWeight(currentWeight);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const tr = strings[kiosk.lang] || strings.es;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-center text-[#1E3F8A] mb-6">
          {kiosk.lang === 'es' ? 'Peso de maleta (demo)' : 'Bag weight (demo)'}
        </h2>
        
        <div className="bg-gray-50 border-2 border-[#1E3F8A] rounded-lg p-6 text-center mb-6">
          <div className="text-5xl font-bold text-[#E20C18] mb-2">
            {currentWeight.toFixed(1)}
          </div>
          <div className="text-lg text-gray-600">kg</div>
        </div>

        <div className="space-y-3">
          <button
            onClick={readWeight}
            className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white font-bold py-3 px-4 rounded-lg"
          >
            {kiosk.lang === 'es' ? 'Leer peso' : 'Read weight'}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              {kiosk.lang === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              onClick={setWeight}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              disabled={currentWeight === 0}
            >
              {kiosk.lang === 'es' ? 'Fijar peso' : 'Set weight'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Global language toggle (for web UI). For PyQt5, TopBar manages this.
function LangSwitch({ kiosk, id }) {
  return (
    <div className="absolute top-0 right-0 p-4 z-20">
      <Button
        id={id}
        variant="ghost"
        className="flex items-center gap-2 bg-[#F2F5FF] text-[#1E3F8A] font-extrabold px-4 py-2 rounded-2xl shadow"
        onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}
      >
        <Languages className="w-5 h-5" /> {kiosk.lang.toUpperCase()}
      </Button>
    </div>
  );
}

function useKiosk() {
  const [airline, setAirline] = useState(null);
  const [rules, setRules] = useState(null);
  const [lang, setLang] = useState("es");
  const [session, setSession] = useState(null);
  const [setup, setSetup] = useState(null);
  
  // Demo mode state
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem("demoMode") === "1";
  });
  const [lastDemoWeight, setLastDemoWeight] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: airlines } = await axios.get(`${API}/config/airlines`);
        const current = airlines.find(a => a.code === "JSM") || airlines[0];
        setAirline(current);
        if (current) {
          const { data: r } = await axios.get(`${API}/rules/${current.code}`);
          setRules(r);
        }
      } catch (e) {
        console.error("Failed to load airline/rules", e?.message);
      }
      try {
        const { data } = await axios.get(`${API}/setup`);
        setSetup(data);
      } catch (_) {
        setSetup(null);
      }
    };
    init();
  }, []);

  const startSession = async () => {
    if (!airline) return;
    const { data } = await axios.post(`${API}/sessions`, { airline_code: airline.code, language: lang });
    setSession(data);
    return data;
  };

  const activateDemoMode = () => {
    setDemoMode(true);
    setLastDemoWeight(null);
    localStorage.setItem("demoMode", "1");
  };

  return { 
    airline, 
    rules, 
    lang, 
    setLang, 
    session, 
    setSession, 
    startSession, 
    setup, 
    setSetup,
    demoMode,
    setDemoMode,
    activateDemoMode,
    lastDemoWeight,
    setLastDemoWeight 
  };
}

// Demo Hotspot - 5 taps in 3 seconds to activate demo mode
function DemoHotspot({ onActivate }) {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  
  const onClick = () => {
    setCount(c => {
      const next = c + 1;
      if (next === 1) {
        timerRef.current = setTimeout(() => setCount(0), 3000); // 3 seconds
      }
      if (next >= 5) { // 5 taps
        clearTimeout(timerRef.current);
        setCount(0);
        onActivate();
        return 0;
      }
      return next;
    });
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      className="absolute top-2 right-2 w-9 h-9 opacity-0 cursor-pointer z-50"
      onClick={onClick}
      title="Área técnica (tocar 5 veces)"
    />
  );
}

// Hidden hotspot (triple tap) - Web UI. In PyQt5 we also implement a similar hidden trigger.
function HiddenSetupHotspot() {
  const nav = useNavigate();
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  const onClick = () => {
    setCount(c => {
      const next = c + 1;
      if (next === 1) {
        timerRef.current = setTimeout(() => setCount(0), 1200);
      }
      if (next >= 3) {
        clearTimeout(timerRef.current);
        setCount(0);
        nav("/setup");
      }
      return next;
    });
  };
  return <div onClick={onClick} className="fixed top-0 left-0 w-14 h-14 z-50" style={{ opacity: 0 }} />;
}

// Setup Screen
// Setup (configurador de vuelos). Stores operator, gate, flight, destination, international flag.
function SetupPage({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const [form, setForm] = useState({ operator_name: "", gate: "A1", flight_number: "JAT36", destination: "Antofagasta — ANF", is_international: false });

  const save = async () => {
    try {
      const payload = { ...form };
      const { data } = await axios.post(`${API}/setup`, payload);
      kiosk.setSetup(data);
      await axios.post(`${API}/interactions`, { event: "setup_saved_client", payload, setup_id: data.id });
      nav("/start"); // after setup, go to Start (last time Start shows its CTA)
    } catch (e) {
      console.error("setup save failed", e?.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <LangSwitch kiosk={kiosk} id="lang_toggle" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold" id="CONFIGURADOR_DE_VUELOS">{tr.setupTitle}</h2>
        </div>
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.operator}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.operator_name} onChange={e => setForm({ ...form, operator_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.gate}</label>
                <select className="w-full border rounded px-3 py-3 text-lg" value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })}>
                  {['A1','A2','A3','A4','A5'].map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.flight}</label>
                <select className="w-full border rounded px-3 py-3 text-lg" value={form.flight_number} onChange={e => setForm({ ...form, flight_number: e.target.value })}>
                  {['JAT36','JAT40','JAT50','JAT811','JAT56'].map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.dest}</label>
                <select className="w-full border rounded px-3 py-3 text-lg" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}>
                  {[
                    { name: 'Antofagasta', code: 'ANF' },
                    { name: 'Arica', code: 'ACM' },
                    { name: 'Temuco', code: 'ZCO' },
                    { name: 'Valdivia', code: 'ZAL' },
                    { name: 'Puerto Montt', code: 'PMC' },
                  ].map(opt => (<option key={opt.code} value={`${opt.name} — ${opt.code}`}>{`${opt.name} — ${opt.code}`}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input id="intl" type="checkbox" className="w-5 h-5" checked={form.is_international} onChange={e => setForm({ ...form, is_international: e.target.checked })} />
                <label htmlFor="intl" className="text-lg font-semibold">{tr.intl}</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button id="btn_save_setup" variant="accent" onClick={save}>{tr.save}</Button>
              <Button id="btn_back_setup" variant="ghost" onClick={() => nav("/")}>{tr.back}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Welcome screen (Inicio)
function Welcome({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const bgUrl = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png";
  return (
    <div className="relative min-h-screen kiosk-bg" style={{ backgroundImage: `url(${bgUrl})` }}>
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <HiddenSetupHotspot />
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">JetSMART</h1>
          <p className="text-gray-700 mb-8">Bienvenido</p>
          <Button id="btn_start" className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/setup")}>{tr.start}</Button>
        </div>
      </div>
    </div>
  );
}

// Start tab screen (same look as Welcome)
function StartScan({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const bgUrl = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png";
  
  const handleDemoActivation = () => {
    kiosk.activateDemoMode();
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = kiosk.lang === 'es' ? 'Modo demo activado' : 'Demo mode activated';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };
  
  return (
    <div className="relative min-h-screen kiosk-bg" style={{ backgroundImage: `url(${bgUrl})` }}>
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <DemoHotspot onActivate={handleDemoActivation} />
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">JetSMART</h1>
          <Button id="btn_go_scan" className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/scan")}>{tr.startScan}</Button>
        </div>
      </div>
    </div>
  );
}

// Baggage rules (Why) page
function WhyPage({ kiosk }) {
  const nav = useNavigate();
  const state = window.history.state?.usr || {};
  const result = state.result || {};
  const rules = state.rules || {};
  const dims = result.dims_cm || {};
  const allowedImg = "https://images.unsplash.com/photo-1670888664952-efff442ec0d2?crop=entropy&cs=srgb&fm=jpg&q=85";
  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-4">{strings[kiosk.lang].whyTitle}</h2>
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <div className="font-semibold">{strings[kiosk.lang].measurement}</div>
                <div>{strings[kiosk.lang].ui.class_label}: maleta</div>
                <div>{strings[kiosk.lang].ui.dimensions_label}: L {dims.length ?? "-"} cm, W {dims.width ?? "-"} cm, H {dims.height ?? "-"} cm</div>
                <div>{strings[kiosk.lang].ui.weight_label}: {result.weight_kg ?? "-"} kg</div>
                <div className="font-semibold mt-4">{strings[kiosk.lang].activeRules}</div>
                <div>{strings[kiosk.lang].ui.max_label}: L {rules?.dims_cm?.length ?? "-"} / W {rules?.dims_cm?.width ?? "-"} / H {rules?.dims_cm?.height ?? "-"} cm, {strings[kiosk.lang].ui.weight_label} {rules?.max_weight_kg ?? "-"} kg</div>
                <div className="font-semibold mt-4">{strings[kiosk.lang].reasons}</div>
                <ul className="list-disc pl-5 text-red-700">
                  {(result.errors || []).map((e, i) => (<li key={i}>{e}</li>))}
                </ul>
              </div>
              <div className="w-full flex flex-col items-center md:items-end">
                <img src={allowedImg} alt="permitido" className="max-h-72 object-contain rounded-xl shadow" />
                <div className="text-sm text-gray-600 mt-2">{strings[kiosk.lang].ui.allowed_dimensions}: L {rules?.dims_cm?.length ?? "-"} / W {rules?.dims_cm?.width ?? "-"} / H {rules?.dims_cm?.height ?? "-"} cm, {strings[kiosk.lang].ui.weight_label} {rules?.max_weight_kg ?? "-"} kg</div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="ghost" className="px-6 py-4" onClick={() => nav(-1)}>{strings[kiosk.lang].ui.back}</Button>
              <Button variant="primary" className="px-6 py-4" onClick={() => nav("/tariffs", { state: { result } })}>{strings[kiosk.lang].continueToPayment}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Scan (with Why navigation)
function Scan({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [weight, setWeight] = useState(null);
  const [dims, setDims] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error("Camera error", e);
      }
    };
    start();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  // Simulate YOLO overlay
  useEffect(() => {
    let raf;
    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) { raf = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // Fake box
      const x = canvas.width * 0.2; const y = canvas.height * 0.2;
      const w = canvas.width * 0.6; const h = canvas.height * 0.6;
      ctx.strokeStyle = "#E20C18"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "rgba(226,12,24,0.8)"; ctx.font = "20px sans-serif";
      ctx.fillRect(x, y - 28, 120, 24);
      ctx.fillStyle = "#fff"; ctx.fillText("maleta", x + 8, y - 10);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const runValidation = async () => {
    try {
      const ss = kiosk.session || await kiosk.startSession();
      const { data } = await axios.post(`${API}/scan`, { session_id: ss.id, weight_kg: weight });
      setDims(data.dims_cm);
      setResult(data);
    } catch (e) {
      console.error("scan failed", e.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: kiosk.airline?.palette?.bg || "#F7FAFF" }}>
      <HiddenSetupHotspot id="hidden_area_setup" />
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="camera-wrap shadow-xl">
            <video id="cam_view" ref={videoRef} className="w-full h-[520px] object-cover rounded-2xl" />
            <canvas ref={canvasRef} className="camera-overlay" />
          </div>
          <div className="flex gap-4 mt-4">
            <Button id="btn_back_scan" variant="ghost" onClick={() => nav("/start")}>{tr.back}</Button>
            <Button id="btn_continue_scan" variant="accent" onClick={runValidation}>{tr.scanNow}</Button>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle id="lbl_bagdata_title">{strings[kiosk.lang].ui.bagdata_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-lg" id="card_measures">
                <div><b id="lbl_width">{strings[kiosk.lang].ui.width_cm}:</b> <span id="out_width_cm">{dims?.width ?? "-"}</span> cm</div>
                <div><b id="lbl_length">{strings[kiosk.lang].ui.length_cm}:</b> <span id="out_length_cm">{dims?.length ?? "-"}</span> cm</div>
                <div><b id="lbl_weight">{strings[kiosk.lang].ui.weight_kg}:</b> <span id="out_weight_kg">{(weight ?? result?.weight_kg) ?? "-"}</span> kg</div>
                <div><b id="lbl_calibration">{strings[kiosk.lang].ui.calibration}:</b> {strings[kiosk.lang].ui.ok}</div>
              </div>
              {result && (
                <div className="mt-6">
                  {result.compliant ? (
                    <>
                      <div className="badge success">{strings[kiosk.lang].msg?.authorized || strings[kiosk.lang].validationOkSub}</div>
                      <div className="flex gap-3 mt-6">
                        <Button id="btn_continue_validate_ok" variant="accent" onClick={() => nav('/goodbye')}>{strings[kiosk.lang].ui?.continue_ok || strings[kiosk.lang].ui?.continue || 'Continuar'}</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="badge error">{strings[kiosk.lang].msg?.not_allowed || strings[kiosk.lang].validationFail}</div>
                      <ul className="list-disc pl-5 mt-3 text-red-700 space-y-1">
                        {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                      </ul>
                      <div className="actions-grid mt-6 w-full">
                        <Button variant="outline" onClick={() => nav('/why', { state: { result, rules: kiosk.rules } })}>{strings[kiosk.lang].why}</Button>
                        <Button id="btn_continue_to_payment" variant="primary" onClick={() => nav('/tariffs', { state: { result } })}>{strings[kiosk.lang].ui?.continue_to_payment || strings[kiosk.lang].continueToPayment || strings[kiosk.lang].goToPayment}</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Payment({ kiosk }) {
  const nav = useNavigate();
  const { state } = useLocation();
  const result = state?.result || null;
  const [method, setMethod] = useState(null);
  const [status, setStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [kioskData, setKioskData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const airlines = (await axios.get(`${API}/config/airlines`)).data;
        const current = airlines.find(a => a.code === "JSM") || airlines[0];
        const rules = (await axios.get(`${API}/rules/${current.code}`)).data;
        let overweight = 0; let oversize = 0;
        if (result) {
          if (result.weight_kg > rules.max_weight_kg) overweight = (result.weight_kg - rules.max_weight_kg) * rules.overweight_fee_per_kg;
          const linear = result.dims_cm.length + result.dims_cm.width + result.dims_cm.height;
          if (linear > rules.max_linear_cm || result.dims_cm.length > rules.dims_cm.length || result.dims_cm.width > rules.dims_cm.width || result.dims_cm.height > rules.dims_cm.height) {
            oversize = rules.oversize_fee_flat;
          }
        }
        setTotal(Math.max(0, Math.round((overweight + oversize) * 100) / 100));
        setKioskData({ rules, airline: current });
      } catch (e) {}
    };
    load();
  }, []);

  const pay = async () => {
    try {
      const ss = await axios.post(`${API}/sessions`, { airline_code: kioskData.airline.code, language: "es" });
      const { data } = await axios.post(`${API}/payments/simulate`, { session_id: ss.data.id, total, method });
      setStatus(data.status);
    } catch (e) {
      setStatus("rejected");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">{strings[kiosk.lang].payTitle}</h2>
        {result && (
          <Card className="mb-6">
            <CardContent>
              <div className="breakdown-row"><span>{strings[kiosk.lang].ui.excess_weight}</span><span>{result.weight_kg} kg</span></div>
              <div className="breakdown-row"><span>{strings[kiosk.lang].ui.excess_dimensions}</span><span>{result.dims_cm.length + result.dims_cm.width + result.dims_cm.height} cm</span></div>
              <div className="breakdown-row font-bold"><span>{strings[kiosk.lang].ui.total}</span><span>{`$${total.toFixed(2)} ${kioskData?.rules?.currency || "USD"}`}</span></div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-2">{strings[kiosk.lang].method}</label>
          <div className="flex gap-3">
            <Button variant={method === "card" ? "primary" : "outline"} onClick={() => setMethod("card")} >{strings[kiosk.lang].card}</Button>
            <Button variant={method === "qr" ? "primary" : "outline"} onClick={() => setMethod("qr")} >{strings[kiosk.lang].qr}</Button>
          </div>
        </div>

        {method && (
          <div className="flex gap-4">
            <Button id="btn_pay" variant="accent" onClick={pay}>{strings[kiosk.lang].ui?.pay || strings[kiosk.lang].processPayment}</Button>
            <Button id="btn_back_tariff" variant="ghost" onClick={() => nav(-1)} >{strings[kiosk.lang].ui?.back || strings[kiosk.lang].back}</Button>
          </div>
        )}

        {status && (
          <div className="mt-6">
            {status === "approved" ? (
              <div className="badge success">{strings[kiosk.lang].approved}</div>
            ) : (
              <div className="badge error">{strings[kiosk.lang].rejected}</div>
            )}
            {status === "approved" && (
              <div className="mt-4 flex gap-3">
                <Button id="btn_finish_payment" variant="primary" onClick={() => nav("/goodbye")}>{strings[kiosk.lang].ui?.finish || strings[kiosk.lang].finishCta}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FreeWeigh() {
  const nav = useNavigate();
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setW(Math.round((Math.random() * 12 + 1) * 10) / 10), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <div className="absolute top-0 right-0 p-4">
        {/* Language switch placeholder; tie into global state if needed */}
      </div>
      <Card className="w-full max-w-xl text-center">
        <CardContent>
          <div className="text-6xl font-extrabold mb-6">{w} kg</div>
          <Button variant="ghost" onClick={() => nav("/start")} >VOLVER</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Train() {
  const [images, setImages] = useState([]);
  const [label, setLabel] = useState("maleta");
  const [log, setLog] = useState([]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      await axios.post(`${API}/dataset/images`, { label, file_name: f.name });
      setImages(prev => [...prev, { name: f.name, label }]);
    }
  };

  const startTrain = async () => {
    const { data } = await axios.post(`${API}/train/start`, { airline_code: "JSM" });
    setLog(prev => [
      ...prev,
      `Training ${data.id} for ${data.airline_code} status: ${data.status}`
    ]);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <div className="absolute top-0 right-0 p-4"></div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-4">Entrenamiento de IA</h2>
        <div className="mb-4">
          <label className="mr-3 font-semibold">Etiqueta:</label>
          <select className="border rounded px-3 py-2" value={label} onChange={e => setLabel(e.target.value)}>
            <option value="maleta">maleta</option>
            <option value="mochila">mochila</option>
            <option value="bolso">bolso</option>
            <option value="otro">otro</option>
          </select>
        </div>
        <input type="file" multiple onChange={onFiles} className="mb-4" />
        <div className="mb-6">
          {images.map((im, i) => (
            <div key={i} className="text-sm text-gray-700">{im.name} - {im.label}</div>
          ))}
        </div>
        <Button variant="primary" onClick={startTrain}>Entrenar YOLO (simulado)</Button>
        <div className="mt-6 space-y-1 text-sm text-gray-600">
          {log.map((l, i) => (<div key={i}>{l}</div>))}
        </div>
      </div>
    </div>
  );
}

function RulesPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <Card className="w-full max-w-2xl">
        <CardContent>
          <h2 className="text-3xl font-extrabold text-[#12356F] mb-4">Maleta no permitida</h2>
          <p className="mb-4">Detalle de equipaje permitido (demo):</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Medidas máximas: 55 cm (largo) × 35 cm (ancho) × 25 cm (alto)</li>
            <li>Peso máximo: 10 kg</li>
            <li>Suma lineal máxima: 115 cm</li>
            <li>Ejemplos: Maleta cabina pequeña, mochila media, bolso de mano</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={() => nav('/scan')}>Comenzar escaneo</Button>
            <Button variant="ghost" onClick={() => nav('/start')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Goodbye({ kiosk }) {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav("/start"), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={64} />
        <div className="mt-3 text-2xl font-bold">{strings[kiosk.lang].msg?.goodbye || 'Gracias por usar el validador. Buen viaje'}</div>
        <div className="text-gray-600">{kiosk.lang === 'en' ? 'Returning to Start…' : 'Regresando a Comenzar…'}</div>
      </div>
    </div>
  );
}

function Shell() {
  const kiosk = useKiosk();
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome kiosk={kiosk} />} />
        <Route path="/start" element={<StartScan kiosk={kiosk} />} />
        <Route path="/setup" element={<SetupPage kiosk={kiosk} />} />
        <Route path="/scan" element={<Scan kiosk={kiosk} />} />
        <Route path="/why" element={<WhyPage kiosk={kiosk} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/tariffs" element={<Payment kiosk={kiosk} />} />
        <Route path="/weigh" element={<FreeWeigh />} />
        <Route path="/train" element={<Train />} />
        <Route path="/goodbye" element={<Goodbye kiosk={kiosk} />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
    axios.get(`${API}/`).catch(() => {});
  }, []);
  return (
    <div className="App">
      <HashRouter>
        <Shell />
      </HashRouter>
    </div>
  );
}

export default App;