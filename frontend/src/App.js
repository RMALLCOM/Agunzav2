import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { CheckCircle2, CircleAlert, CreditCard, Languages } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// i18n minimal
const strings = {
  es: {
    start: "INICIAR",
    startScan: "COMENZAR ESCANEO",
    setupTitle: "Configuración previa",
    operator: "Operador",
    gate: "Puerta de embarque",
    flight: "N° de vuelo",
    dest: "Destino",
    intl: "Internacional",
    save: "GUARDAR",
    back: "Volver",
    readWeight: "Leer peso",
    validationOk: "AUTORIZADO",
    validationOkSub: "Autorizado para embarque. ¡Buen viaje!",
    validationFail: "NO CUMPLE",
    retryMeasure: "Volver a medir",
    goToPayment: "Continuar al pago",
    payTitle: "Tarifas y Pago",
  },
  en: {
    start: "START",
    startScan: "START SCAN",
    setupTitle: "Pre-flight setup",
    operator: "Operator",
    gate: "Gate",
    flight: "Flight #",
    dest: "Destination",
    intl: "International",
    save: "SAVE",
    back: "Back",
    readWeight: "Read weight",
    validationOk: "AUTHORIZED",
    validationOkSub: "Authorized for boarding. Have a great trip!",
    validationFail: "NOT COMPLIANT",
    retryMeasure: "Measure again",
    goToPayment: "Continue to payment",
    payTitle: "Pricing & Payment",
  },
};

function useKiosk() {
  const [airline, setAirline] = useState(null);
  const [rules, setRules] = useState(null);
  const [lang, setLang] = useState("es");
  const [session, setSession] = useState(null);
  const [setup, setSetup] = useState(null);

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

  return { airline, rules, lang, setLang, session, setSession, startSession, setup, setSetup };
}

// Hidden hotspot (triple tap) always present
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
function SetupPage({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const [form, setForm] = useState({ operator_name: "", gate: "", flight_number: "", destination: "", is_international: false });

  const save = async () => {
    try {
      const payload = { ...form };
      const { data } = await axios.post(`${API}/setup`, payload);
      kiosk.setSetup(data);
      await axios.post(`${API}/interactions`, { event: "setup_saved_client", payload, setup_id: data.id });
      nav("/startmeasure");
    } catch (e) {
      console.error("setup save failed", e?.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold">{tr.setupTitle}</h2>
          <div className="flex items-center gap-2">
            <Languages />
            <Button variant="ghost" onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}>{kiosk.lang.toUpperCase()}</Button>
          </div>
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
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.flight}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.flight_number} onChange={e => setForm({ ...form, flight_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.dest}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input id="intl" type="checkbox" className="w-5 h-5" checked={form.is_international} onChange={e => setForm({ ...form, is_international: e.target.checked })} />
                <label htmlFor="intl" className="text-lg font-semibold">{tr.intl}</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="accent" onClick={save}>{tr.save}</Button>
              <Button variant="ghost" onClick={() => nav("/start")}>{tr.back}</Button>
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
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">JetSMART</h1>
          <p className="text-gray-700 mb-8">Bienvenido</p>
          <Button className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/setup")}>{tr.start}</Button>
        </div>
      </div>
    </div>
  );
}

// Shared Start Measure layout pieces
function StartMeasureShell({ children, onBack, onOptions, showOptions }) {
  const hero = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png";
  const jetsmartLogo = "https://dummyimage.com/120x120/ffffff/1E3F8A.png&text=JS";
  const allcomLogo = "https://dummyimage.com/80x24/ffffff/1E3F8A.png&text=ALLCOM";
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "#ffffff" }}>
      <div className="sm-card w-[90%] max-w-[900px]">
        <div className="sm-topbar">
          <button onClick={onBack} className="text-[#1E3F8A] text-2xl font-bold" aria-label="Volver">&lt;</button>
          <div className="sm-title">Comenzar a Medir</div>
          <button onClick={onOptions} className="text-2xl" aria-label="Opciones">📷</button>
        </div>
        <div className="px-6 pb-4">
          <div className="sm-hero" style={{ backgroundImage: `url(${hero})` }} />
          <div className="sm-badge"><img src={jetsmartLogo} alt="JetSMART" className="w-16 h-16 object-contain" /></div>
          <div className="text-center">
            <button className="sm-primary-btn" onClick={() => onBack && onBack("scan")}>COMENZAR ESCANEO</button>
          </div>
          {showOptions}
          <div className="sm-footer">
            <img src={allcomLogo} alt="Allcom" className="h-6 object-contain" />
            <img src={jetsmartLogo} alt="JetSMART" className="h-6 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StartMeasureNormal() {
  const nav = useNavigate();
  return (
    <StartMeasureShell
      onBack={(dest) => nav(dest === "scan" ? "/scan" : "/")}
      onOptions={() => nav("/startmeasure/options")}
      showOptions={null}
    />
  );
}

function StartMeasureOptions() {
  const nav = useNavigate();
  const OptionsPanel = (
    <>
      <div onClick={() => nav("/startmeasure")} className="fixed inset-0" style={{ background: "transparent" }} />
      <div className="options-panel">
        <button className="options-btn" onClick={() => nav("/priority")}>MALETA CON PRIORIDAD</button>
        <button className="options-btn" onClick={() => nav("/weigh")}>PESAJE</button>
        <button className="options-btn" onClick={() => nav("/train")}>ENTRENAMIENTO IA</button>
      </div>
    </>
  );
  return (
    <StartMeasureShell
      onBack={(dest) => nav(dest === "scan" ? "/scan" : "/")}
      onOptions={() => nav("/startmeasure")}
      showOptions={OptionsPanel}
    />
  );
}

function PriorityPlaceholder() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "#fff" }}>
      <Card className="w-[90%] max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-extrabold text-[#1E3F8A] mb-2">Maleta con Prioridad</h2>
          <p className="text-gray-600">Pantalla placeholder. Aquí irá el flujo para prioridad.</p>
          <div className="mt-4 flex gap-3">
            <Button variant="primary" onClick={() => nav('/scan')}>Ir a escanear</Button>
            <Button variant="ghost" onClick={() => nav('/startmeasure')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Scan
function Scan({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [weight, setWeight] = useState(null);
  const [dims, setDims] = useState(null);
  const [result, setResult] = useState(null);
  const menuIcon = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/xklegk9w_image.png";
  const [menuOpen, setMenuOpen] = useState(false);

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
      ctx.fillRect(x, y - 28, 160, 24);
      ctx.fillStyle = "#fff"; ctx.fillText(noPermitted ? "no permitido" : "maleta", x + 8, y - 10);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [noPermitted]);

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
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="camera-wrap shadow-xl">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setMenuOpen(!menuOpen)} className="bg-white/90 rounded-full shadow px-2 py-2">
                <img src={menuIcon} alt="menu" className="w-10 h-10" />
              </button>
              {menuOpen && (
                <div className="mt-3 bg-white rounded-2xl shadow-xl p-4 w-64 text-center">
                  <div className="text-[#12356F] font-extrabold uppercase text-lg border-b pb-3 cursor-pointer" onClick={() => { setMenuOpen(false); history.replaceState({}, "", "/startmeasure/options"); }}>OPCIONES NUEVO FLUJO</div>
                  <div className="text-[#12356F] font-extrabold uppercase text-lg border-b pb-3 cursor-pointer" onClick={() => { setMenuOpen(false); location.href='/rules'; }}>MALETA NO PERMITIDA</div>
                  <div className="text-[#12356F] font-extrabold uppercase text-lg border-b py-3 cursor-pointer" onClick={() => { setMenuOpen(false); location.href='/weigh'; }}>PESAJE LIBRE</div>
                  <div className="text-[#12356F] font-extrabold uppercase text-lg pt-3 cursor-pointer" onClick={() => { setMenuOpen(false); location.href='/train'; }}>ENTRENAMIENTO IA</div>
                </div>
              )}
            </div>
            <video ref={videoRef} className="w-full h-[520px] object-cover rounded-2xl" />
            <canvas ref={canvasRef} className="camera-overlay" />
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="ghost" onClick={() => window.location.href = "/startmeasure"}>VOLVER</Button>
            <Button variant="accent" onClick={runValidation}>CONTINUAR</Button>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Datos de pieza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-lg">
                <div><b>Ancho:</b> {dims?.width ?? "-"} cm</div>
                <div><b>Alto:</b> {dims?.height ?? "-"} cm</div>
                <div><b>Largo:</b> {dims?.length ?? "-"} cm</div>
                <div className="text-2xl mt-3"><b>Peso:</b> {weight ?? "-"} kg</div>
              </div>
              {result && (
                <div className="mt-6">
                  {result.compliant ? (
                    <div className="badge success">{strings["es"].validationOk}</div>
                  ) : (
                    <div className="badge error">{strings["es"].validationFail}</div>
                  )}
                  {!result.compliant && (
                    <ul className="list-disc pl-5 mt-3 text-red-700 space-y-1">
                      {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                    </ul>
                  )}
                  <div className="flex gap-3 mt-6">
                    {result.compliant ? (
                      <>
                        <Button variant="accent" onClick={() => window.location.href='/goodbye'}>CONTINUAR</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" onClick={() => { setResult(null); setDims(null); }}>VOLVER A MEDIR</Button>
                        <Button variant="primary" onClick={() => window.location.href='/payment'}>{strings["es"].goToPayment}</Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
            <Button variant="ghost" onClick={() => nav('/startmeasure')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Payment() { /* ...existing unchanged... */ }
function FreeWeigh() { /* ...existing unchanged... */ }
function Train() { /* ...existing unchanged... */ }
function Goodbye() { /* ...existing unchanged... */ }

function Shell() {
  const kiosk = useKiosk();
  return (
    <>
      <HiddenSetupHotspot />
      <Routes>
        <Route path="/" element={<Welcome kiosk={kiosk} />} />
        <Route path="/setup" element={<SetupPage kiosk={kiosk} />} />
        <Route path="/startmeasure" element={<StartMeasureNormal />} />
        <Route path="/startmeasure/options" element={<StartMeasureOptions />} />
        <Route path="/priority" element={<PriorityPlaceholder />} />
        <Route path="/scan" element={<Scan kiosk={kiosk} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/weigh" element={<FreeWeigh />} />
        <Route path="/train" element={<Train />} />
        <Route path="/goodbye" element={<Goodbye />} />
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
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </div>
  );
}

export default App;